# Festival Pad Gallery v10

Supabase URL과 Publishable key가 이미 포함된 버전입니다.

## 포함된 Supabase 설정
- URL: https://bqxiynipuynejmxbcxwv.supabase.co
- Publishable key: sb_publishable_klZA8aUBI1uJNQ3JHQcehA_0vlQFRY

## 파일
- `index.html` : 그림 참여 화면
- `gallery.html` : 칠판형 디지털 갤러리
- `config.js` : Supabase 설정
- `assets/supabase.js` : Supabase 연결 도우미
- `assets/gallery.js` : 갤러리 로직
- `supabase/schema.sql` : DB / Storage / RLS / Realtime 설정
- `.github/workflows/pages.yml` : GitHub Pages 배포

## 적용 순서
1. Supabase SQL Editor에서 `supabase/schema.sql` 전체 실행
2. GitHub 저장소에 이 폴더 내용을 전부 업로드
3. Settings > Pages > GitHub Actions
4. 참여 화면 `/`
5. 갤러리 `/gallery.html`
