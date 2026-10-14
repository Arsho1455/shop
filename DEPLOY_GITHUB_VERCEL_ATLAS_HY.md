# Shop.project — GitHub + Vercel + MongoDB Atlas

Այս տարբերակը տեղակայվում է որպես **ՄԵԿ Vercel Project**՝ նույն դոմենում և՛ React/Vite կայքով, և՛ Express API-ով։
Դրա շնորհիվ աշխատում են `/auth`, `/profile`, `/admin/login`, իսկ JWT HttpOnly cookie-ն աշխատում է նույն դոմենում։

## 1. MongoDB Atlas

1. Բացիր https://cloud.mongodb.com/ և ստեղծիր Atlas նախագիծ ու Cluster։ Ընտրիր քեզ մոտ տարածաշրջան։
2. **Database Access** բաժնում ստեղծիր տվյալների բազայի user՝ ուժեղ գաղտնաբառով։ Տուր միայն անհրաժեշտ իրավունքներ (օր. `readWrite`՝ `PhoneShop` բազայի համար)։ Սա **Atlas account user-ը չէ**։
3. **Network Access** → ավելացրու թույլատրելի IP-ներ։ Local ստուգման համար ավելացրու քո ընթացիկ IP-ն։ Vercel-ի փոփոխվող ելքային IP-ների դեպքում երբեմն փորձարկման համար հարկավոր է `0.0.0.0/0` (allow from anywhere)՝ սա ռիսկային է. այդ տարբերակում պարտադիր օգտագործիր ուժեղ գաղտնաբառ և նվազագույն DB իրավունքներ, production-ում նախընտրիր ֆիքսված ելքային IP/private կապ։
4. **Clusters → Connect → Drivers**-ից պատճենիր `mongodb+srv://...` connection string-ը։ Տեղադրիր քո DB օգտատիրոջ անունը և գաղտնաբառը։ Եթե դրանք պարունակում են `@`, `#`, `%`, `:` և այլն, URL-encode արա։
5. Գաղտնաբառը **չուղարկես չաթով ու GitHub մի տեղադրիր**։

## 2. Ադմին ստեղծիր Atlas-ում

Տեղական `Server/.env`-ում Atlas URI-ն դրիր `MONGODB_URI=...` (կամ `MONGO_URL=...`) և դրիր նույն `MONGO_DB_NAME=PhoneShop`, որը օգտագործելու ես Vercel-ում։ `JWT_SECRET`-ը նույնպես լրացրու։

```cmd
npm install
npm run admin:create -- gabrielyanarsho3@gmail.com
```

Սահմանված գաղտնաբառը այսպիսով կպահվի Atlas-ի `PhoneShop.adminaccounts` collection-ում։
CLI-ն աշխատեցրու համակարգչում, քանի որ Vercel-ի runtime-ում ինտերակտիվ հրամաններ չեն աշխատում։

## 3. GitHub repository

Նախագիծը բացիր root պանակում (այնտեղ, որտեղ `package.json`, `Client`, `Server`, `api`, `vercel.json` են)։

```cmd
git init
git add .
git commit -m "Prepare PhoneShop for Vercel and MongoDB Atlas"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/Shop.project.git
git push -u origin main
```

Նախքան `git add .` կատարելը ստուգիր, որ **չկան .env գաղտնի ֆայլեր staging-ում**՝ `git status`։
GitHub-ում նախ ստեղծիր **դատարկ** repository՝ օրինակ `Shop.project`։ Եթե repo-ն արդեն գոյություն ունի, `git remote add origin`-ի փոխարեն փոխիր remote-ը կամ օգտագործիր եղած repository-ի հոսքը։

## 4. Vercel-ը կապիր GitHub-ին

1. Բացիր https://vercel.com/new և Import ընտրիր քո `Shop.project` repository-ն։
2. **Root Directory = `./`** (ոչ `Client`, ոչ `Server`)։
3. Framework Preset: **Vite**։ Root `vercel.json`-ը տալիս է Build Command `npm run build`, Output `Client/dist`, և `/api/*` rewrite դեպի Vercel Node Function։
4. `Settings → Environment Variables`-ում ավելացրու ստորևի backend-only արժեքները (Production, անհրաժեշտության դեպքում Preview)։ **VITE_API_URL մի ավելացրու**․ API-ն նույն origin-ում է։

| Անուն | Արժեք |
|---|---|
| `MONGODB_URI` | քո իրական Atlas `mongodb+srv://...` URI-ն |
| `MONGO_DB_NAME` | `PhoneShop` |
| `JWT_SECRET` | երկար պատահական գաղտնիք, նույնը որը օգտագործում ես տեղական `Server/.env`-ում |
| `SMTP_HOST` | `smtp.gmail.com` կամ քո SMTP host-ը |
| `SMTP_PORT` | `465` (եթե Gmail) |
| `SMTP_USER` | նամակ ուղարկող հասցեն |
| `SMTP_PASS` | Google App Password կամ SMTP password |
| `CONTACT_TO_EMAIL` | որտեղ ստանալ կոնտակտային նամակները |
| `COOKIE_SAME_SITE` | `lax` |
| `COOKIE_SECURE` | `true` |
| `NODE_ENV` | `production` |

`FRONTEND_URL`-ը կարող ես չավելացնել՝ Vercel-ի ավտոմատ `VERCEL_PROJECT_PRODUCTION_URL`-ից production հասցեն կվերցվի, եթե System Environment Variables-ը միացված են։ Սեփական դոմեն ունենալու դեպքում ավելի լավ է բացահայտ սահմանել `FRONTEND_URL=https://YOUR_DOMAIN`։ **Չի կարելի թողնել `http://localhost:5173`** production-ում։

5. Սեղմիր **Deploy**։ Եթե հետո environment variables-ը փոխես, նոր **Redeploy** արա։
6. Ստուգիր `https://YOUR_DOMAIN.vercel.app/api/health` → `{ "ok": true }`։
7. Փորձարկիր գրանցում→նամակ→Email հաստատում→մուտք→Favorites/Cart→Admin `/admin/login`։

## 5. Ինչու մեկ Vercel project

Shop Frontend-ն ու Backend-ը նույն դոմենում են։ Այդ պատճառով browser-ը չի մերժի cross-site/third-party cookie-ները և API-ի base URL-ը `'/api/...'` է։
Backend-ը չի գործարկում `app.listen` Vercel-ում։ Այն արտահանվում է `Server/app.js`-ից և կանչվում է `api/index.js` function-ից։ Local development-ում server-ը գործարկվում է `Server/start.js`-ով։

## 6. Սխալների արագ ստուգում

- `/api/health`-ը 503 է → Atlas-ի URI, DB user, Network Access, Vercel logs։
- `/api/health`-ը 404 կամ HTML է → Vercel Root Directory=`./`, `vercel.json`-ը root-ում է, `api/index.js` գործառույթը deploy է արվել։
- Login-ը աշխատում է, բայց user session չի պահվում → HTTPS, cookie Secure, request URL `/api/..` նույն origin-ում, browser DevTools → Cookies։
- Գրանցումը 502 `MAIL_FAILED` → SMTP_USER/SMTP_PASS/SMTP_HOST/SMTP_PORT։ Gmail-ը պահանջում է App Password, ոչ հիմնական գաղտնաբառ։ Vercel-ում 25 պորտը արգելափակված է, 465/587-ը թույլատրվում են, սակայն production-ի համար transaction email provider-ը ավելի կայուն է։
- Admin չկա → տեղական `npm run admin:create -- email@example.com`՝ նույն Atlas բազայի հետ։
- Vercel-ում Build error → Settings → Build & Deployment, Node.js 22, Framework Vite, Root `./`։

## 7. Ստուգումներ մինչև push

```cmd
npm install
npm test
npm run build
```

ԿԱՐԵՎՈՐ․ Այս ZIP-ը պատրաստված է deploy-ի համար, սակայն կոնկրետ քո GitHub/Vercel/Atlas հաշիվներում ավտոմատ տեղադրում կամ live deployment այս փուլում կատարված չէ։
