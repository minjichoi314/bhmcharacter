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


## v11 갤러리 변경
- 칠판에 올라오는 작품의 포스트잇 외곽 모양을 다양화
- 하트 / 곰돌이 / 별 / 꽃 / 원 / 구름 모양 순환
- 포스트잇 색상도 파스텔 핑크 / 베이지 / 노랑 / 보라 / 하늘 / 민트로 순환
- 작품 이미지는 각 모양 중앙의 흰 프레임 안에 유지
- 마스킹테이프 효과 유지


## v12 갤러리 제목 변경
- `우리의 축제 한 장` 삭제
- `학생들이 만든 그림이 칠판에 하나씩 붙습니다.` 삭제
- `현재 작품 N개` 삭제
- 갤러리 상단 문구를 `지금 이 순간, 우리의 이야기` 하나만 표시
