# capstone

## 홈페이지 문의 폼

운영 사이트는 캡스톤 Cloudflare 계정의 `capstone-site` Pages 프로젝트에 직접 업로드하여 배포합니다. GitHub에 푸시하는 것만으로는 운영 사이트가 갱신되지 않습니다.

문의 폼은 같은 사이트의 `POST /api/contact`를 호출하고, Pages의 `_worker.js`가 문의를 검증한 뒤 기존 Daum SMTP로 `info@capstone-pco.com`에 전달합니다. 발신 주소도 회사 메일로 고정하며, 방문자가 입력한 이메일은 `Reply-To`에 사용합니다. SMTP 서버가 메시지 전체를 접수한 후에만 완료 메시지를 표시하고 폼을 비웁니다. 메일함에서의 최종 수신은 실제 전송 테스트로 확인해야 합니다.

### 발송 설정

`info@capstone-pco.com`이 연결된 Daum 계정에서 **환경설정 → IMAP/POP3 설정**의 SMTP 사용을 확인하고 앱 비밀번호를 준비합니다. 일반 로그인 비밀번호를 사용하지 않습니다. 스마트워크 메일 주소와 SMTP 로그인 아이디는 서로 다를 수 있으므로, Daum 설정 화면에 표시된 사용자 이름을 확인합니다. [Daum SMTP 안내](https://cs.daum.net/faq/service/43/category/9234/detail/24094), [스마트워크 사용자 이름 안내](https://cs.daum.net/faq/service/43/category/13114/detail/24450)를 참고하세요.

Cloudflare의 **capstone-site → Settings → Variables and Secrets → Production**에 다음을 설정합니다.

| 이름 | 종류 | 값 |
| --- | --- | --- |
| `SMTP_USERNAME` | Secret | 회사 메일에 연결된 Daum SMTP 로그인 아이디 |
| `SMTP_PASSWORD` | Secret | 해당 Daum 계정의 앱 비밀번호 |

인증 정보를 `REACT_APP_*` 변수, GitHub 파일, 채팅 또는 브라우저 코드에 넣지 않습니다. SMTP 서버는 `smtp.daum.net:465`로 고정하고 TLS로 연결합니다. 기존 회사 메일의 MX/SPF 레코드는 유지합니다. Preview에도 별도로 Secret을 설정해야 Preview에서 실제 발송을 확인할 수 있습니다.

### 검증 및 배포

`capston_main/`에서 실행합니다.

```sh
npm ci
npm run test:contact
npm run build
```

프런트엔드 빌드에는 기존 `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, 기존에 지정한 경우 `REACT_APP_ADMIN_PIN`을 동일하게 사용합니다. 빌드 명령은 정적 파일과 함께 `build/_worker.js`, `build/_routes.json`을 생성합니다. `_routes.json`은 `/api/contact`에만 서버 함수를 실행하도록 제한합니다.

Cloudflare에서 **capstone-site → Create deployment**를 열어 `build/` 안의 파일을 ZIP 또는 폴더로 업로드합니다. ZIP 안의 최상위 경로에 `index.html`과 `_worker.js`가 있어야 합니다. Preview에서 확인한 후 Production에 배포합니다. 서버 설정 변경 시에는 새 배포를 생성해야 반영됩니다.

검증할 동작: 실제 문의 메일 수신과 회신 주소, 성공 후 입력 초기화, 실패 후 입력 보존, 중복 클릭 방지. 발송 계정이 설정되지 않았거나 인증/전송이 실패하면 오류를 표시합니다. 동일 문의의 재시도에는 같은 `Message-ID`를 사용하지만 SMTP는 중복 방지를 보장하지 않으므로, 전송 직후 연결이 끊기면 재시도 시 중복 수신 가능성이 있습니다.
