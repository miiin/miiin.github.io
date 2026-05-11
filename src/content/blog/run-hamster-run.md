---
title: 사이드바에서 햄스터가 달린다 — Run Hamster Run 플러그인을 만들었어요🐹
date: '2026-05-11'
tags:
  - 개발
  - 하찮코딩
  - VS Code
  - Open VSX
  - Extension
---

**"생산성? 그런 건 모르겠고, 내 햄스터가 귀엽습니다."**

![Run Hamster Run 데모](/images/run-hamster-run-demo.gif)

[VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=soop.run-hamster-run) · [Open VSX](https://open-vsx.org/extension/soop/run-hamster-run) · [GitHub](https://github.com/miiin/run-hamster-run)

개발자 멘탈 케어용(사실상 타건 노동 착취) 확장 프로그램을 만들었습니다.🐹 키보드 불나게 치면 챗바퀴가 돌아가고, 클릭해서 밥을 줄 수 있어요.

`vscode-pets` 같은 펫 확장들을 구경하다가 "내가 코드를 빨리 치면 그 열기만큼 같이 달려주는 친구가 있으면 좋겠다"는 생각이 들어서, 별 이유 없이 만들어버린 VS Code 확장입니다. 거창한 건 없고 그냥 '하찮지만 확실한 즐거움'이 목표예요.

---

## 무슨 확장이냐면

- **타이핑 속도에 따른 휠** — 휠 속도는 실시간 타이핑 속도에 따라 조절됩니다.
- **자연스러운 휴식 동작** — 타이핑을 멈추면 햄스터가 돌아다니며 가끔씩 앉아서 쉽니다.
- **클릭하여 먹이 주기** — 아무 곳에나 씨앗을 떨어뜨리세요. 햄스터가 가서 가져올 거예요
- **하트 보상** — 식사 후 햄스터 머리 위에 하트가 나타납니다

## 어떻게 동작하냐면

핵심은 `vscode.workspace.onDidChangeTextDocument`로 슬라이딩 윈도우(기본 2초) 안에 들어온 글자 수를 세서 cps(초당 글자수)를 계산하는 거예요. 이 값을 200ms마다 webview로 넘기면 햄스터 애니메이션의 프레임 간격(대략 `220 - cps * 12` ms, 최소 30ms)이 거기에 맞춰 조절됩니다. 빨리 칠수록 프레임이 촥촥 넘어가니까 발이 안 보이게 뛰는 거죠.

한 가지 신경 쓴 건, 복붙이나 전체 선택 후 덮어쓰기를 "타이핑"으로 세지 않는 것. `contentChanges`에서 순수하게 늘어난 글자만 골라냅니다.

```ts
const added = event.contentChanges.reduce((sum, c) => sum + Math.max(0, c.text.length - c.rangeLength), 0);
```

햄스터의 걷기·앉기·씨앗 찾아 먹기 같은 동작은 전부 webview 안의 작은 상태 머신(WALK / SIT / SEEK / EAT / RUN)으로 돌아가요. 스프라이트는 직접 픽셀로 하나하나 찍어서 그렸고, CSP는 `script-src 'nonce-...'`만 허용하도록 잠가뒀습니다. 패키징해서 VS Code Marketplace에 올려뒀어요.

## 이스터 에그

이스터 에그를 직접 찾는 재미도 쏠쏠하니, 힌트만 드리겠습니다.

- **FEVER** — 손가락에 불이 붙을 정도로 빠르게 입력하세요.
- **???** — 패널을 클릭하여 포커스를 맞춘 다음, 80년대 게이머라면 누구나 아는 치트 코드를 입력하세요.

## 설정

`settings.json`에서 감도를 맞출 수 있어요.

| 설정                       | 기본값 | 설명                                      |
| -------------------------- | ------ | ----------------------------------------- |
| `hamsterRun.idleThreshold` | `0.2`  | 이 cps 이하면 idle(쉬는 중)로 간주        |
| `hamsterRun.windowMs`      | `2000` | 타자 속도 계산용 슬라이딩 윈도우 길이(ms) |

## 아직 아쉬운 점

- 햄스터가 아직 사이드바 패널 안에서만 삽니다. `vscode-pets`처럼 에디터를 돌아다니게 만들고 싶은 야망이…
- 사이드바를 접으면 패널이 꺼지면서 햄스터 상태가 초기화돼요

## 마치며

생산성에 도움 되는 확장은 아니지만 하찮은 코딩을 시리즈 물로 만들어보고싶은 생각이 들었습니다.

설치는 확장 패널에서 **Run Hamster Run** 검색, 또는:

```
ext install soop.run-hamster-run
```

코드는 [GitHub](https://github.com/miiin/run-hamster-run)에 MIT로 열어뒀어요. PR과 별(Star)은 언제나 환영합니다!
