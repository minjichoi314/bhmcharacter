# Festival Pad Gallery v5

## 이번 버전
- 단계 제목 삭제: `1. 그림 그리기`, `2. 축제 참여 소감` 표시 없음
- 스케치북 한 장 같은 참여 화면
- 이모티콘 대신 SVG 손그림 일러스트
- 축제 소감을 작성해야 전송 가능
- 전송 완료 팝업에 `디지털 갤러리 보기` 버튼
- 디지털 갤러리는 초록 칠판 스타일
- 학생 작품은 파스텔 포스트잇 + 마스킹테이프 느낌
- `Nanum Pen Script`, `Gaegu` 기반 손글씨 분위기

## 적용 순서
1. Supabase SQL Editor에서 `supabase/schema.sql` 전체 실행
2. `config.js`에 실제 Project URL / Publishable key 입력
3. GitHub 저장소에 전체 파일 업로드
4. GitHub Settings > Pages > Source = GitHub Actions
5. 참여 화면: `/`
6. 디지털 갤러리: `/gallery.html`

## config.js 예시
```js
window.APP_CONFIG = {
  SUPABASE_URL: "https://xxxx.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_xxx",
  EVENT_ID: "festival-2026",
  EVENT_NAME: "우리의 축제 한 장",
  AUTO_RESET_SECONDS: 12,
  AUTO_APPROVE: true
};
```

브라우저 코드에는 `service_role` 또는 secret key를 넣지 마세요.
