# capstone

## 홈페이지 문의 폼

운영 사이트는 캡스톤 Cloudflare 계정의 `capstone-site` Pages 프로젝트에 직접 업로드하여 배포합니다. GitHub에 푸시하는 것만으로는 운영 사이트가 갱신되지 않습니다.

문의 폼은 같은 사이트의 `POST /api/contact`를 호출합니다. Pages의 `_worker.js`가 문의를 검증한 뒤 기존 Netlify 프로젝트 `deft-kangaroo-cf7474`의 `capstone-contact` 폼으로 전달합니다. Netlify의 기존 메일 알림 수신 주소는 `info@capstone-pco.com`이며 방문자 이메일 필드는 회신 주소로 사용됩니다. Netlify의 접수 완료 페이지와 요청 식별번호까지 확인한 후에만 완료 메시지를 표시하고 폼을 비웁니다. 메일함에서의 최종 수신은 실제 전송 테스트로 확인해야 합니다.

### 기존 Netlify 설정

Netlify의 **deft-kangaroo-cf7474 → Forms**에서 `capstone-contact` 폼과 **Submission notifications → Email info@capstone-pco.com** 알림을 유지합니다. 2026-10-14에 기존 설정과 3월의 검증된 접수 1건을 확인했습니다.

접수 주소는 `https://deft-kangaroo-cf7474.netlify.app/`로 고정되어 있습니다. Cloudflare에서는 별도 SMTP 비밀번호나 API 키가 필요하지 않습니다. 기존 다음 회사 메일의 MX/SPF와 도메인의 Cloudflare 연결을 유지합니다.

`public/index.html`의 숨김 폼은 Netlify가 폼을 계속 인식하도록 유지하는 등록용 HTML입니다. Netlify 프로젝트를 배포할 때 이 폼을 삭제하거나 자동 감지를 끄면 접수가 중단될 수 있습니다. 운영 홈페이지의 발송은 Cloudflare Pages 함수를 통해 처리합니다.

### 검증 및 배포

`capston_main/`에서 실행합니다.

```sh
npm ci
npm run test:contact
npm run build
```

프런트엔드 빌드에는 기존 `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, 기존에 지정한 경우 `REACT_APP_ADMIN_PIN`을 동일하게 사용합니다. 빌드 명령은 정적 파일과 함께 `build/_worker.js`, `build/_routes.json`을 생성합니다. `_routes.json`은 `/api/contact`에만 서버 함수를 실행하도록 제한합니다.

Cloudflare에서 **capstone-site → Create deployment**를 열어 `build/` 안의 파일을 ZIP 또는 폴더로 업로드합니다. ZIP 안의 최상위 경로에 `index.html`과 `_worker.js`가 있어야 합니다. Preview에서 확인한 후 Production에 배포합니다. 서버 설정 변경 시에는 새 배포를 생성해야 반영됩니다.

검증할 동작: Netlify의 새 접수 기록, 실제 문의 메일 수신과 회신 주소, 성공 후 입력 초기화, 실패 후 입력 보존, 중복 클릭 방지. HTTP 오류, 도메인 리다이렉트, 일반 홈페이지 HTML 응답 또는 접수 확인 누락 시 오류를 표시합니다. 동일 문의의 재시도에는 같은 접수번호를 본문에 첨부하지만 서버 간 중복 방지를 보장하지 않으므로, 전송 직후 연결이 끊기면 재시도 시 중복 수신 가능성이 있습니다. Netlify의 스팸 분류와 메일 알림 설정도 점검합니다.
