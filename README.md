# capstone

## 홈페이지 문의 폼

운영 사이트는 캡스톤 Cloudflare 계정의 `capstone-site` Pages 프로젝트에 직접 업로드하여 배포합니다. GitHub에 푸시하는 것만으로는 운영 사이트가 갱신되지 않습니다.

문의 폼은 같은 사이트의 `POST /api/contact`를 호출하고, Pages의 `_worker.js`가 문의를 검증한 뒤 Resend API로 `info@capstone-pco.com`에 전달합니다. 방문자가 입력한 이메일은 `Reply-To`에 사용합니다. 서버의 성공 응답과 발송 접수번호가 모두 확인되어야 완료 메시지를 표시하고 폼을 비웁니다.

### 발송 설정

Resend에서 발송 도메인(예: `forms.capstone-pco.com`)을 인증한 뒤 Cloudflare의 **capstone-site → Settings → Variables and Secrets → Production**에 다음을 설정합니다.

| 이름 | 종류 | 값 |
| --- | --- | --- |
| `RESEND_API_KEY` | Secret | 인증한 발송 도메인의 Sending access API key |
| `CONTACT_FROM_EMAIL` | Text | 예: `CAPSTONE 문의 <website@forms.capstone-pco.com>` |

API 키를 `REACT_APP_*` 변수, GitHub 파일 또는 브라우저 코드에 넣지 않습니다. 기존 다음 회사 메일의 루트 도메인 MX 레코드는 유지하고, 발송 도메인 인증은 별도 서브도메인에 적용합니다. Preview에도 별도로 변수를 설정해야 Preview에서 실제 발송을 확인할 수 있습니다.

### 검증 및 배포

`capston_main/`에서 실행합니다.

```sh
npm ci
npm run test:contact
npm run build
```

프런트엔드 빌드에는 기존 `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, 기존에 지정한 경우 `REACT_APP_ADMIN_PIN`을 동일하게 사용합니다. 빌드 명령은 정적 파일과 함께 `build/_worker.js`, `build/_routes.json`을 생성합니다. `_routes.json`은 `/api/contact`에만 서버 함수를 실행하도록 제한합니다.

Cloudflare에서 **capstone-site → Create deployment**를 열어 `build/` 안의 파일을 ZIP 또는 폴더로 업로드합니다. ZIP 안의 최상위 경로에 `index.html`과 `_worker.js`가 있어야 합니다. Preview에서 확인한 후 Production에 배포합니다. 서버 설정 변경 시에는 새 배포를 생성해야 반영됩니다.

검증할 동작: 실제 문의 메일 수신과 회신 주소, 성공 후 입력 초기화, 실패 후 입력 보존, 중복 클릭 방지. 발송 서비스가 설정되지 않았거나 전송이 실패하면 오류를 표시합니다.
