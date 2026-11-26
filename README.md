# 포커 프로

그린 펠트와 골드 테마의 홀덤 팟오즈 계산기입니다. 웹 PWA와 Android 앱을 제공합니다.

## 기능

- 내 패와 보드 카드 빠른 선택
- 포지션과 상대 수 선택
- 메인 팟, 사이드 팟, 콜 금액 계산
- 몬테카를로 방식 승률 추정
- 추천 액션, 콜 허용 여부, 추천 베팅 금액 표시

## 웹 실행

```powershell
npm install
npm run dev
```

## Android 배포 빌드

Release APK는 로컬에 보관하는 Android 서명 키로 서명합니다. 키 파일과 비밀번호는 저장소에 커밋하지 마세요.

Gradle 사용자 설정 `%USERPROFILE%\.gradle\gradle.properties`에 다음 값을 설정합니다.

```properties
pokerProKeyStore=C:/Users/USERNAME/.android/keystores/poker-pro-upload.jks
pokerProKeyAlias=pokerpro-upload
pokerProStorePassword=YOUR_STORE_PASSWORD
pokerProKeyPassword=YOUR_KEY_PASSWORD
```

빌드 명령:

```powershell
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleRelease
```

APK 경로: `android/app/build/outputs/apk/release/app-release.apk`.
향후 동일 앱의 업데이트 배포에 서명 키가 필요하므로 안전한 위치에 백업하세요.
