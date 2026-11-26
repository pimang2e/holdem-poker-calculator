# 홀덤 원팟 계산기

모바일 친화형 홀덤 팟오즈 계산 PWA입니다.

## 기능

- 내 패와 보드 카드 빠른 입력
- 포지션과 상대 수 선택
- 메인 팟, 사이드 팟, 콜 금액 계산
- 몬테카를로 방식 승률 추정
- 추천 액션, 콜 허용 여부, 추천 베팅 금액 표시

## 실행

```powershell
npm install
npm run dev
```

## 빌드

```powershell
npm run build
npm run preview
```

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
