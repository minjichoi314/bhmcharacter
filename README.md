# Festival Pad Gallery v15

이번 버전에서 갤러리/참여 화면 제목을 모두
**지금 이 순간, 우리의 이야기**
로 통일했습니다.

## Supabase REST URL
https://bqxiynipuynejmxbcxwv.supabase.co/rest/v1/

## 중요한 오류 수정
현재 사용하던 Publishable key는 Supabase 서버에서
`Invalid API key / AccessDenied`
로 거절되고 있습니다.

이 오류는 HTML/JavaScript 코드로 우회할 수 없습니다.
반드시 Supabase에서 현재 프로젝트의 유효한 Publishable key를 다시 복사해야 합니다.

### 키 넣는 위치
`config.js`

```js
SUPABASE_PUBLISHABLE_KEY: "여기에_복사한_전체_Publishable_key"
```

### 복사 위치
Supabase
→ Settings
→ API Keys
→ Publishable key
→ 오른쪽 복사 버튼

## 구조
- `index.html` : 그림 그리기 / 전시하기
- `gallery.html` : 칠판형 디지털 갤러리
- `config.js` : REST URL / Publishable key
- `assets/supabase.js` : REST/Storage 요청
- `assets/gallery.js` : 갤러리 자동 갱신
- `supabase/schema.sql` : artworks 테이블 / Storage / RLS

## 인증 방식
- `Authorization: Bearer` 사용 안 함
- Publishable key는 `apikey` 헤더에만 전송
- REST API 주소는 사용자가 지정한 `/rest/v1/` 주소를 직접 사용
