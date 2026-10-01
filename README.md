# Festival Pad Gallery v6

이번 버전은 **CSS 파일 경로 문제로 화면이 깨지는 상황을 방지하기 위해**
`index.html`, `gallery.html`, `admin.html`에 핵심 CSS를 직접 포함했습니다.

## 주요 변경
- 참여 화면: 스케치북 스타일
- 단계 제목 삭제
- 축제 소감 작성 필수
- 전송 성공 후 `디지털 갤러리 보기` 버튼
- 디지털 갤러리: 초록 칠판 스타일
- 작품: 파스텔 포스트잇 + 마스킹테이프 느낌
- 손글씨 폰트 느낌
- 일러스트는 작은 SVG로 크기를 강제해 과도하게 커지지 않도록 수정

## 적용
1. `supabase/schema.sql` 실행
2. `config.js`에 실제 Supabase URL / Publishable key 입력
3. GitHub 저장소에 전체 파일 업로드
4. Pages에서 GitHub Actions 사용
5. 참여 화면: `/`
6. 갤러리: `/gallery.html`
