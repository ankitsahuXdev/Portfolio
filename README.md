# Ankit Sahu — Portfolio (Professional Version)

Aapki purani portfolio ko poora naya, responsive, animated design diya gaya hai — aur ek real backend bhi add kiya hai jo contact form ke messages **save** karta hai aur aapko **turant notify** karta hai (email + optional Telegram).

```
Portfolio_Professional/
├── README.md              <- ye file
├── frontend/               <- aapki website (index.html kholte hi chal jayegi)
└── backend/                 <- contact form ka server (Node.js)
```

---

## 1. Frontend dekhna (sabse aasan tareeka)

Bas `frontend/index.html` ko double-click karke browser mein khol lijiye. Poora design, animations, sab kaam karega.

Contact form kaam karne ke liye (backend se connect hone ke liye), neeche wala **Backend chalana** section follow karein — jab tak backend nahi chalega, form "backend running nahi hai" wala message dikhayega.

### Free mein online host karna (taaki link kisi ko bhi bhej sakein)
Sabse aasan free options:
- **Netlify** — netlify.com par jaake `frontend` folder ko drag-and-drop karein, turant live link mil jayega.
- **GitHub Pages** — `frontend` folder ka content ek GitHub repo mein daal ke Settings → Pages se enable karein.

---

## 2. Backend chalana (contact form ke messages save + notify karne ke liye)

### Step 1 — Node.js install karein
Agar pehle se nahi hai, [nodejs.org](https://nodejs.org) se LTS version install kar lijiye (Node 18 ya usse upar chahiye).

### Step 2 — Dependencies install karein
Terminal/CMD kholke:
```
cd backend
npm install
```

### Step 3 — `.env` file banayein
`backend/.env.example` file ko copy karke naam `.env` rakh dein, aur usme apni values bharein (neeche har cheez explain ki gayi hai).

### Step 4 — Server start karein
```
npm start
```
Terminal mein ye dikhna chahiye: `✅ Backend running at http://localhost:5000`

Ab `frontend/index.html` khol ke contact form try karein — message save ho jayega aur (agar email/Telegram configure kiya hai) aapko notification bhi mil jayegi.

---

## 3. Messages kaha save hote hain?

Do options hain, `.env` mein `DB_TYPE` se control hota hai:

- **`DB_TYPE=json`** (default, kuch install nahi karna) — messages `backend/data/messages.json` file mein save hote hain. Zero setup, turant kaam karta hai.
- **`DB_TYPE=mysql`** — agar aapke paas MySQL hai (jaise XAMPP/WAMP), to messages seedhe MySQL database mein save honge. `.env` mein `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` bharein. Table khud-ba-khud ban jayega (ya `backend/schema.sql` ko phpMyAdmin mein manually run kar sakte hain).

Dono mein kabhi bhi switch kar sakte hain, code change karne ki zaroorat nahi.

---

## 4. Aapko pata kaise chalega ki koi contact kiya? (Notifications)

### Option A — Email (recommended, sabse reliable)
Gmail "App Password" chahiye hoga (normal password kaam nahi karega):
1. Google Account → Security → **2-Step Verification** ON karein (agar pehle se nahi hai).
2. https://myaccount.google.com/apppasswords par jaake ek naya App Password banayein (naam kuch bhi de dein, jaise "Portfolio").
3. Jo 16-digit password mile, wahi `.env` mein daalein:
   ```
   EMAIL_USER=aapka-email@gmail.com
   EMAIL_PASS=wo-16-digit-app-password
   ```
4. Jab bhi koi form submit karega, isi Gmail par email aa jayegi — Gmail app phone mein hai to notification bhi turant mil jayegi.

### Option B — Telegram (optional, sabse fast — turant phone pe push aata hai)
1. Telegram mein **@BotFather** ko message karein → `/newbot` → naam de dein → aapko ek **token** milega.
2. Apne naye bot ko ek baar koi bhi message bhej dein (taaki wo aapko message kar sake).
3. Browser mein ye URL kholein (TOKEN apna daalein): `https://api.telegram.org/bot<TOKEN>/getUpdates` — usme `"chat":{"id": ...}` dikhega, wahi aapka `chat_id` hai.
4. `.env` mein daalein:
   ```
   TELEGRAM_BOT_TOKEN=aapka-token
   TELEGRAM_CHAT_ID=aapka-chat-id
   ```

Dono ek saath bhi use kar sakte hain, ya sirf ek — jo configure nahi hoga wo bas silently skip ho jayega, error nahi aayega.

---

## 5. Saare messages ek jagah dekhna (Admin Panel)

`.env` mein `ADMIN_KEY` set karein (koi bhi secret jaisa text, jaise `ADMIN_KEY=ankit123secret`).

Backend chalu hone ke baad browser mein kholein: **http://localhost:5000/admin**
Apna ADMIN_KEY daalein → saare saved messages dikh jayenge (naam, email, message, time).

---

## 6. Hamesha live rakhne ke liye (zaroori agar portfolio online share karni hai)

Agar backend sirf apne laptop pe `npm start` se chal raha hai, to contact form **sirf tab kaam karega jab aapka laptop chalu ho aur server running ho**. Recruiter/client jab bhi visit kare tab backend zinda rahe, iske liye backend ko free host karein:

1. **Render.com** (free tier) par account banayein → "New Web Service" → apna backend code GitHub se ya zip se deploy karein.
2. Root directory `backend` set karein, Build command `npm install`, Start command `npm start`.
3. Environment variables wahi daalein jo `.env` mein hain (Render ke dashboard mein "Environment" section se).
4. Deploy hone ke baad ek URL milega, jaise `https://ankit-portfolio-backend.onrender.com`.
5. `frontend/js/config.js` mein ye line update kar dein:
   ```js
   const API_BASE_URL = "https://ankit-portfolio-backend.onrender.com";
   ```
6. Frontend ko dobara host/upload kar dein.

(Railway.app aur Cyclic.sh bhi similar free options hain agar Render pasand na aaye.)

---

## 7. Zaroor update karne wali cheezein (placeholders)

Maine kuch jagah placeholder rakha hai kyunki mujhe aapki real details nahi pata:

| Kahan | File | Kya update karna hai |
|---|---|---|
| Email | `frontend/index.html` (Contact section) | `you@example.com` → apna real email |
| Phone | `frontend/index.html` (Contact section) | `+91 00000 00000` → apna real number |
| GitHub / LinkedIn / Instagram | `frontend/index.html` (Contact section, social icons) | `href="#"` → apne real profile links |
| Project links ("View Project") | `frontend/index.html` (Projects section) | `href="#"` → jab project live/deployed ho, uska real link daalein |
| API URL (backend deploy karne ke baad) | `frontend/js/config.js` | localhost URL → deployed backend URL |

---

## 8. Original files jo use nahi hui

Aapke upload mein kuch aisi files thi jo naye professional design mein fit nahi hui (jaise poore-page background video, ek "flip card" photo effect, aur ek skills-infographic image) — inhe hata diya hai taaki site fast aur clean lage. Aapki original `Portfolio.zip` file safe hai, kuch delete nahi hua — bas naye build mein include nahi kiya. Chahein to inhe khud kisi section mein add kar sakte hain.

Skills section ke actual percentages (HTML 90%, CSS 70%, JavaScript 20%, Python 25%, Java 10%, aur React.js/Node.js/MongoDB/Git — abhi seekh rahe hain) aapki di hui image se hi liye gaye hain, matlab data same hai bas presentation naya hai.

---

## 9. Kya-kya naya hai (summary)

- Poori tarah **responsive** (mobile/tablet/laptop sab pe sahi dikhega — pehle wala design sirf ek fixed screen size pe kaam karta tha)
- Scroll animations, typing effect, animated skill bars, hover effects, mobile menu, back-to-top button
- Real **backend**: messages save hote hain (JSON file ya MySQL) + email/Telegram notification
- Spam se basic protection (rate limiting + honeypot field)
- Admin panel saare messages dekhne ke liye
- Images optimize kiye gaye (site pehle se kaafi fast load hogi)
- SEO-friendly meta tags, favicon, aur social-share preview

Koi bhi step mein atke to bata dijiyega!
