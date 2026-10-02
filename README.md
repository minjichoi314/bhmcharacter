# Festival Pad Gallery v14

이 버전은 사용자가 지정한 REST API 주소를 그대로 사용합니다.

## Supabase 설정
REST API:
https://bqxiynipuynejmxbcxwv.supabase.co/rest/v1/

Publishable key:
sb_publishable_klZA8aUBI1uJNQ3JHQcehA_0vlQFRY

## 중요
- REST 조회/insert는 `SUPABASE_REST_URL`을 직접 사용합니다.
- Storage 업로드 주소는 REST URL의 도메인에서 자동 생성합니다.
- `Authorization: Bearer ...` 헤더는 사용하지 않습니다.
- Publishable key는 `apikey` 헤더로만 전달합니다.

## 구조
- `index.html` : 그림 그리기 + 전시하기
- `gallery.html` : 칠판형 디지털 갤러리
- `config.js` : REST URL / Publishable key
- `assets/supabase.js` : REST / Storage fetch 함수
- `assets/gallery.js` : 갤러리 5초 자동 갱신
- `supabase/schema.sql` : DB / Storage / RLS 설정
- `.github/workflows/pages.yml` : GitHub Pages 배포

## 적용 순서
1. Supabase SQL Editor에서 `supabase/schema.sql` 전체 실행
2. GitHub 저장소에 이 폴더 내용을 전부 업로드
3. Settings → Pages → GitHub Actions 설정
4. 참여 화면 `/`
5. 갤러리 `/gallery.html`

## 갤러리
상단 제목은 `지금 이 순간, 우리의 이야기`만 표시됩니다.
작품은 하트 / 곰돌이 / 별 / 꽃 / 원 / 구름 모양의 파스텔 포스트잇 형태로 표시됩니다.
