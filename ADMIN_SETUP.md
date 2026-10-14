# Առանձին ադմինի հաշիվ — Shop.project

Այս տարբերակում Admin-ը **առանձին հաշիվ է**, և խանութի գրանցում / Email-ի հաստատում **պարտադիր չէ**։

## Առաջին գործարկում (Windows)

1. Քո նախորդ նախագծից պատճենիր `Server/.env` և `Client/.env` ֆայլերը։
2. Համոզվիր, որ `Server/.env`-ում `MONGO_URL`/`MONGODB_URI`, `JWT_SECRET` և `FRONTEND_URL` արժեքները ճիշտ են։
3. CMD-ում բացիր գլխավոր պանակը՝

```cmd
cd C:\Users\Admin\Desktop\Shop.project
npm install
npm run admin:create -- gabrielyanarsho3@gmail.com
```

4. Terminal-ը կխնդրի երկու անգամ նշել **նոր գաղտնաբառ** (12+ նիշ)։ Դաշտը թաքցված է, հավաքելիս ոչ մի նիշ չի երևա։ Սեղմիր Enter։
5. Գործարկիր՝

```cmd
npm run dev
```

6. Բացիր `http://localhost:5173/admin/login`, մուտքագրիր `gabrielyanarsho3@gmail.com` և հենց նոր ստեղծած գաղտնաբառը։

## Երբ մոռացել ես գաղտնաբառը

```cmd
npm run admin:password -- gabrielyanarsho3@gmail.com
```

Նոր գաղտնաբառ սահմանելը կչեղարկի նախկին Admin սեսիաները։

> Մի ուղարկիր գաղտնաբառը, `.env`-ը կամ `JWT_SECRET`-ը ուրիշներին։
> Եթե փորձում ես այս հրամանները ոչ ինտերակտիվ միջավայրում, գաղտնաբառի անվտանգ մուտքագրման համար բացիր CMD/PowerShell։
