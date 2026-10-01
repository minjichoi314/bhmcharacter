# Festival Pad Gallery v2

패드 5대에서 그림과 축제 참여 소감을 입력하고, 하나의 공용 전시장에 모으는 웹앱입니다.

## 구조

- GitHub Pages: 프론트엔드 배포
- Supabase Database: 작품 정보 저장
- Supabase Storage: 그림 이미지 저장
- Supabase Realtime: gallery.html 실시간 갱신

## 파일

- `index.html` : 패드 참여 화면
- `gallery.html` : 실시간 전시장
- `admin.html` : 테스트용 운영 화면
- `config.js` : Supabase와 행사 설정
- `assets/app.js` : 그림/업로드 로직
- `assets/gallery.js` : 전시장 로직
- `assets/admin.js` : 운영자 화면
- `assets/supabase.js` : 공통 연결/오류 처리
- `supabase/schema.sql` : DB/Storage/RLS/Realtime 설정
- `.github/workflows/pages.yml` : GitHub Pages 자동 배포

---

## 1. Supabase 설정

Supabase 프로젝트를 만든 뒤 SQL Editor에서:

`supabase/schema.sql`

전체를 실행합니다.

그다음 Dashboard > Project Settings > API 에서:

- Project URL
- Publishable key 또는 anon public key

를 복사합니다.

`config.js` 수정:

```js
window.APP_CONFIG = {
  SUPABASE_URL: "https://xxxx.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_...",
  EVENT_ID: "festival-2026",
  EVENT_NAME: "우리의 축제 한 장",
  AUTO_RESET_SECONDS: 8,
  AUTO_APPROVE: true
};
```

주의:
- `service_role`
- secret key

는 프론트엔드에 넣으면 안 됩니다.

---

## 2. GitHub Pages 배포

```bash
git init
git add .
git commit -m "Initial festival gallery"
git branch -M main
git remote add origin https://github.com/YOUR_ID/YOUR_REPO.git
git push -u origin main
```

GitHub:

Settings → Pages → Source → GitHub Actions

배포 후:

- 참여 패드: `https://YOUR_ID.github.io/YOUR_REPO/`
- 전시장: `https://YOUR_ID.github.io/YOUR_REPO/gallery.html`
- 관리자 테스트: `https://YOUR_ID.github.io/YOUR_REPO/admin.html`

---

## 3. Failed to fetch가 나올 때

이번 버전은 index.html 오른쪽 아래에 연결 상태를 표시합니다.

먼저 확인:

1. `config.js`의 SUPABASE_URL이 실제 URL인지
2. 키가 실제 publishable / anon public key인지
3. `supabase/schema.sql`을 실행했는지
4. GitHub Pages 주소에서 실행하는지
5. 행사장 Wi-Fi에서 `supabase.co` 접속이 차단되지 않았는지
6. 광고 차단/보안 앱이 요청을 막고 있지 않은지

`Failed to fetch`는 일반적으로 DB 정책 오류보다
네트워크/URL/브라우저 요청 단계에서 막힐 때 자주 보입니다.

---

## 4. 패드 5대 운영

패드 5대 모두 같은 참여 URL을 사용합니다.

각 패드는 최초 접속 시 자체 `device_id`를 생성합니다.

제출 흐름:

1. 그림 그리기
2. 제목 입력
3. 소감 입력
4. 공개 동의
5. 제출
6. 완료 화면
7. 자동 초기화

---

## 5. 승인형 운영

config.js에서:

```js
AUTO_APPROVE: false
```

로 바꾸면 신규 작품은 `pending` 상태로 저장됩니다.

다만 현재 admin.html은 보안을 단순화한 테스트용입니다.
실제 공개 행사에서는 Supabase Auth 기반 운영자 로그인을 추가하는 것을 권장합니다.
