---
title: 세팅 시 처음에 만나는 CORS 에러
date: '2026-04-06'
tags:
  - 개발
---

# Vue 3 + Vite에서 Axios 설정 및 CORS 에러 해결 (Proxy + 403 대응까지)

프로젝트 세팅을 하고 데이터를 연동할 때 거의 가장 처음 마주하는 문제가 CORS 에러이다.  
늘 비슷하게 해결해서 간단한 듯 하지만 은근히 기억에 안 남고 넘어가곤 해서 이번에 글로 정리해본다.

## TL;DR

- Vite에서는 `VITE_` 붙은 환경변수만 사용 가능
- CORS는 브라우저 보안 정책이라 Proxy로 우회해야 함
- 일부 서버(Spring Security 등)는 Origin/Referer까지 검사함
- 이 경우 `proxyReq`에서 헤더 제거해야 해결됨

---

## CORS 간단 이해

CORS는 브라우저 보안 정책으로, 다른 Origin(도메인/포트/프로토콜)으로 요청할 때 서버가 허용하지 않으면 차단된다.

---

## 1. Axios 설치 & 공통 인스턴스 만들기

```bash
npm install axios
```

매번 API 호출할 때마다 `axios.create()`를 반복하긴 싫으니까, `src/lib/axios.ts`에 공통 인스턴스를 하나 만들어뒀다.

```typescript
import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 예: 토큰 자동 주입
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          window.location.href = '/login';
          break;
        case 403:
          console.error('접근 권한이 없습니다.');
          break;
        case 500:
          console.error('서버 오류가 발생했습니다.');
          break;
      }
    }
    return Promise.reject(error);
  },
);

export default api;
```

인터셉터를 미리 잡아두면 인증 토큰 주입이나 에러 핸들링을 한 곳에서 관리할 수 있어서 편하다.

---

## 2. 환경변수 설정

`.env` 파일을 만들고 처음에 이렇게 썼다.

```
API_BASE_URL=https://test-server.co.kr/api/web/v1
```

근데 요청이 `http://localhost:5374/...`로 나간다. baseURL이 아예 안 먹히는 것.

원인은 간단했다.

👉 **Vite는 `VITE_` 접두사가 붙은 환경변수만 클라이언트에 노출한다.**

```
VITE_API_BASE_URL=/api/web/v1
```

이렇게 바꿔주니 해결. `.gitignore`에 `.env` 추가하는 것도 잊지 말자.

---

## 3. CORS 문제 해결 — Vite Proxy 설정

환경변수를 처음에 외부 도메인으로 직접 넣으면 브라우저에서 CORS 에러가 발생한다.

핵심은 브라우저가 아니라 **Vite 서버가 대신 요청을 보내도록 만드는 것**이다.

```
브라우저 → localhost:5374/api/...  (같은 Origin)
              ↓ Vite Proxy
         https://test-server.co.kr/api/...
```

👉 브라우저 기준에서는 같은 Origin이기 때문에 CORS가 발생하지 않는다.

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://test-server.co.kr',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 4. 403 Invalid CORS request (Spring Security 케이스)

이 설정만으로 해결되면 좋겠지만, 일부 서버는 프록시 요청에도 403을 반환한다.

특히 Spring Security 환경에서는 `Origin`, `Referer` 헤더를 검사해서 차단하는 경우가 있다.

문제는 Vite 프록시가 요청을 중계할 때  
👉 **브라우저의 Origin / Referer 헤더를 그대로 전달한다는 것**

그래서 서버 입장에서는 여전히 CORS 요청으로 판단한다.

---

## 5. 최종 해결: proxyReq에서 헤더 직접 제어

`configure` 옵션으로 `http-proxy` 요청을 가로채서 헤더를 제거한다.

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://test-server.co.kr',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
            proxyReq.setHeader('Cookie', 'JSESSIONID=세션값');
          });
        },
      },
    },
  },
});
```

### 설정 설명

| 설정                       | 하는 일                              |
| -------------------------- | ------------------------------------ |
| `changeOrigin: true`       | `Host` 헤더를 target 도메인으로 변경 |
| `removeHeader('origin')`   | 서버의 CORS 검사 우회                |
| `removeHeader('referer')`  | 일부 서버 대응                       |
| `setHeader('Cookie', ...)` | 인증 쿠키 직접 주입                  |

이렇게 하니까 드디어 200 OK. 데이터가 내려온다.

---

## ⚠️ 주의사항 (중요)

`origin`, `referer` 제거 및 Cookie 직접 주입 방식은 **개발 환경에서만 사용해야 한다.**

프로덕션에서는 반드시:

- 서버에서 CORS 설정을 올바르게 처리하거나
- 인증 구조를 정상적으로 구성해야 한다

👉 프록시로 우회하는 방식은 어디까지나 개발 편의용이다.

---

## 6. 사용 예시

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/lib/axios';

const list = ref([]);

onMounted(async () => {
  const { data } = await api.post('enterprise/enterpriseList', {
    pageNum: 0,
    pageSize: 20,
  });
  list.value = data.body.enterpriseList;
});
</script>
```

---

## 삽질 포인트 정리

| 증상              | 원인                                 | 해결                                       |
| ----------------- | ------------------------------------ | ------------------------------------------ |
| baseURL이 안 먹힘 | 환경변수에 `VITE_` 접두사 누락       | `VITE_API_BASE_URL`로 변경                 |
| CORS 에러         | 브라우저가 외부 도메인으로 직접 요청 | Vite Proxy로 우회                          |
| Proxy 써도 403    | `Origin` 헤더가 그대로 전달됨        | `proxyReq`에서 `origin`, `referer` 제거    |
| 인증 실패         | 쿠키가 프록시에 안 붙음              | `proxyReq.setHeader('Cookie', ...)`로 주입 |

---

## 결론

`changeOrigin: true`만으로 해결되지 않는 경우가 꽤 있다.  
특히 Spring Security처럼 `Origin`을 검사하는 서버라면, proxy 레벨에서 헤더를 직접 제어해야 한다.

---

> Vite Proxy는 개발 환경에서만 동작한다.  
> 프로덕션에서는 Nginx 등에서 리버스 프록시를 별도로 설정해야 한다.
