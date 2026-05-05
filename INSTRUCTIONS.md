# Heirs Structural-Link AI — Setup Instructions

Everything you need to put in place before running the project.
Follow in order. Do not skip steps.

---

## 1. Accounts to Create (Do This First)

| Service | Free Tier | What It's For |
|---------|-----------|---------------|
| [MongoDB Atlas](https://cloud.mongodb.com) | ✅ Free | Database |
| [Upstash](https://upstash.com) | ✅ Free | Redis sessions |
| [Cloudinary](https://cloudinary.com) | ✅ Free | Frame storage |
| [Twilio](https://twilio.com) | ✅ Trial | WhatsApp bot |
| [Modal.com](https://modal.com) | ✅ Free GPU | AI model hosting |
| [Vercel](https://vercel.com) | ✅ Free | Web app hosting |
| [Railway](https://railway.app) | ✅ Free starter | Bot + API hosting |
| [Roboflow](https://universe.roboflow.com) | ✅ Free | Car damage dataset |

---

## 2. MongoDB Atlas Setup

1. Create account at cloud.mongodb.com
2. Create a new **free M0 cluster**
3. Create a database user:
   - Database Access → Add New Database User
   - Username: `heirs`
   - Password: generate a strong one, save it
   - Role: **Read and write to any database**
4. Allow network access:
   - Network Access → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
5. Get connection string:
   - Clusters → Connect → Drivers → Node.js
   - Copy the URI — looks like: `mongodb+srv://heirs:<password>@cluster0.xxxxx.mongodb.net/`
6. Replace `<password>` with your actual password
7. Add `/heirs` before the `?` to set the database name:
   ```
   mongodb+srv://heirs:yourpassword@cluster0.xxxxx.mongodb.net/heirs?retryWrites=true&w=majority
   ```
8. Paste this as `MONGODB_URI` in `bot/.env`

---

## 3. Upstash Redis Setup

1. Create account at upstash.com
2. Create a new Redis database:
   - Name: `heirs-sessions`
   - Region: pick closest to Nigeria (EU-West or US-East)
   - Type: **Regional**
3. Copy the **REST URL** and **Token** from the dashboard
4. Use the **Redis URL** (starts with `rediss://`) as `REDIS_URL` in `bot/.env`

---

## 4. Cloudinary Setup

1. Create account at cloudinary.com
2. From the Dashboard, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Create an upload preset:
   - Settings → Upload → Upload Presets → Add upload preset
   - Preset name: `heirs_unsigned`
   - Signing Mode: **Unsigned**
   - Folder: `heirs-claims`
   - Save
4. Add to `web/.env`:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=heirs_unsigned
   ```

---

## 5. Twilio WhatsApp Setup

1. Create account at twilio.com
2. Go to **Messaging → Try it out → Send a WhatsApp message**
3. Follow the sandbox activation steps — send the join code to the Twilio sandbox number
4. From the Console, copy:
   - **Account SID** → `TWILIO_ACCOUNT_SID`
   - **Auth Token** → `TWILIO_AUTH_TOKEN`
5. The sandbox number is: `+14155238886` → add as `TWILIO_WHATSAPP_FROM=whatsapp:+14155238886`
6. Configure the sandbox webhook:
   - Messaging → Settings → WhatsApp Sandbox Settings
   - **When a message comes in**: `https://your-railway-bot-url.railway.app/webhook/whatsapp`
   - Method: **HTTP POST**
   - Save

> For production (after hackathon), you apply for a real WhatsApp Business number through Twilio.

---

## 6. Bot Environment Variables

Edit `bot/.env` (create it if missing):

```env
PORT=3001
MONGODB_URI=mongodb+srv://heirs:yourpassword@cluster0.xxxxx.mongodb.net/heirs?retryWrites=true&w=majority
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
REDIS_URL=rediss://:yourpassword@yourhost.upstash.io:6380
WEB_APP_URL=https://your-vercel-app.vercel.app
AI_SERVICE_URL=https://your-modal-endpoint.modal.run
```

---

## 7. Web App Environment Variables

Edit `web/.env` (create it if missing):

```env
VITE_API_URL=https://your-railway-bot-url.railway.app/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=heirs_unsigned
```

> During local development, use `http://localhost:3001/api` for `VITE_API_URL`

---

## 8. AI Model Setup

### 8a. Download the Dataset (Roboflow)

1. Go to [universe.roboflow.com](https://universe.roboflow.com)
2. Search: **"car damage detection"**
3. Pick a dataset with 1,000+ images (CarDD is recommended)
4. Click **Download** → Format: **YOLOv8** → Download to Zip
5. Extract into `ai/dataset/`
6. Open `ai/dataset/data.yaml` and verify:
   ```yaml
   nc: 4
   names: ['dent', 'scratch', 'deformation', 'crack']
   ```
   If class names differ, rename them to match the above.

### 8b. Train YOLOv8

```bash
pip install -r ai/requirements.txt
python ai/train.py --data ai/dataset/data.yaml --epochs 50 --batch 16
```

- If you get an out-of-memory error: reduce `--batch` to `8`
- If you have a GPU: add `--device 0`
- Training takes ~2 hours on CPU, ~25 minutes on GPU

### 8c. Copy Trained Weights

```bash
cp runs/detect/heirs_damage_v1/weights/best.pt ai/best.pt
```

### 8d. Convert Eniola's Excel to JSON

Once Eniola sends the completed Excel file:

```bash
python ai/convert_lookup.py /path/to/eniola_lookup.xlsx
```

This creates `ai/lookup.json` — the Von Mises prediction table.

### 8e. AI Service Environment Variables

Edit `ai/.env` (create it if missing):
```env
MODEL_PATH=best.pt
LOOKUP_PATH=lookup.json
PORT=8000
```

Note: `ai/depth.py` loads MiDaS via `torch.hub` and will download weights on first run. If you're deploying to a restricted environment, pre-warm the cache and set `TORCH_HOME` to a writable directory.

---

## 9. Modal.com AI Deployment

Modal gives you free GPU inference — this is where the Python AI service runs.

1. Install Modal: `pip install modal`
2. Authenticate: `modal token new`
3. Create `ai/modal_deploy.py`:

```python
import modal

stub = modal.Stub("heirs-ai")
image = modal.Image.debian_slim().pip_install_from_requirements("requirements.txt")

@stub.function(image=image, gpu="T4", timeout=120)
@modal.web_endpoint(method="POST")
def analyse(item: dict):
    from pipeline import analyse_claim
    return analyse_claim(item["frame_urls"], item["car_model"])
```

4. Deploy: `modal deploy ai/modal_deploy.py`
5. Copy the URL Modal gives you → paste as `AI_SERVICE_URL` in `bot/.env`

---

## 10. Installing and Running Locally

### Prerequisites
- Node.js 20+
- Python 3.11+

### Install dependencies
```bash
# Bot
cd bot
npm install

# Web app
cd ../web
npm install

# Python AI service (from repo root)
cd ..
pip install -r ai/requirements.txt
```

### Run everything locally

**Terminal 1 — Bot:**
```bash
cd bot
npm run dev
```

**Terminal 2 — Web App:**
```bash
cd web
npm run dev
```

**Terminal 3 — AI Service:**
```bash
cd ai
python main.py
```

### Expose bot to the internet (for Twilio webhook)

Twilio needs a public URL to send WhatsApp messages to your local bot.
Use ngrok during development:

```bash
npm install -g ngrok
ngrok http 3001
```

Copy the ngrok URL (e.g. `https://abc123.ngrok.io`) and set it as your Twilio webhook:
```
https://abc123.ngrok.io/webhook/whatsapp
```

---

## 11. Deploying to Production

### Web App → Vercel

```bash
cd web
npm run build
# Push to GitHub → connect repo to Vercel → auto-deploys on push
```

Add environment variables in Vercel dashboard:
- `VITE_API_URL`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

### Bot → Railway

1. Connect GitHub repo to Railway
2. Set root directory to `bot`
3. Add all environment variables from `bot/.env`
4. Railway auto-deploys on push to main

---

## 12. What You Need from Teammates

### From Eniola

| File | Description |
|------|-------------|
| `eniola_lookup.xlsx` | 91 rows — 90 ANSYS simulation results + header. All columns filled. |

Once received, run:
```bash
python ai/convert_lookup.py eniola_lookup.xlsx
```

### From Fodunrin

| File | Description |
|------|-------------|
| `toyota_camry_front.svg` | Toyota Camry wireframe — front view |
| `toyota_camry_rear.svg` | Toyota Camry wireframe — rear view |
| `toyota_camry_left.svg` | Toyota Camry wireframe — left side |
| `toyota_camry_right.svg` | Toyota Camry wireframe — right side |
| `honda_accord_front.svg` | Honda Accord — front |
| `honda_accord_rear.svg` | Honda Accord — rear |
| `honda_accord_left.svg` | Honda Accord — left |
| `honda_accord_right.svg` | Honda Accord — right |
| `lexus_rx_front.svg` | Lexus RX — front |
| `lexus_rx_rear.svg` | Lexus RX — rear |
| `lexus_rx_left.svg` | Lexus RX — left |
| `lexus_rx_right.svg` | Lexus RX — right |
| `damage_diagram.svg` | Top-down car with 6 named zone paths |

Once received:
- Put the ghost frame SVGs in `web/src/assets/ghostframes/`
- Replace the placeholder SVG code in `web/src/components/GhostFrame.tsx` with the actual imported SVG
- Replace the placeholder paths in `web/src/components/DamageMap.tsx` with Fodunrin's `damage_diagram.svg` paths

---

## 13. Pricing Engine — Manual Update

The `ai/pricing.py` file contains a `SEED_PRICES` dictionary.
Update these prices from current Ladipo Market rates before the demo.

For the automated scraper (Week 2 Day 14), run:
```bash
cd ai
python scraper.py  # (build this in Week 2)
```

---

## 14. Demo Day Checklist

- [ ] MongoDB Atlas cluster running
- [ ] Upstash Redis live
- [ ] Cloudinary upload preset `heirs_unsigned` created
- [ ] Twilio sandbox activated on your phone
- [ ] `best.pt` trained and deployed to Modal
- [ ] `lookup.json` generated from Eniola's Excel
- [ ] Bot deployed to Railway with all env vars
- [ ] Web app deployed to Vercel with all env vars
- [ ] End-to-end flow tested on mobile
- [ ] Demo car scanned and pre-recorded video ready
- [ ] `/claim/demo/report` pre-loaded with Toyota Camry result as fallback
- [ ] Video saved to laptop, USB, Google Drive, and phone

---

## 15. Project Structure Reference

```
heirs-structural-link/
├── web/                  # React + TypeScript (Vite)
│   ├── src/
│   │   ├── pages/        # Scan.tsx, Processing.tsx, Report.tsx
│   │   ├── components/   # GhostFrame.tsx, DamageMap.tsx
│   │   ├── api/          # client.ts (axios)
│   │   └── hooks/        # useCloudinaryUpload.ts
├── bot/                  # Node.js + Express
│   └── src/              # webhook.ts, api.ts, session.ts, notify.ts
└── ai/                   # Python + FastAPI
    ├── main.py           # FastAPI routes
    ├── pipeline.py       # Full analyse_claim()
    ├── detect.py         # YOLOv8
    ├── depth.py          # MiDaS
    ├── lookup.py         # Von Mises table
    ├── pricing.py        # Nigerian parts pricing
    ├── train.py          # YOLOv8 training script
    └── convert_lookup.py # Excel → JSON converter
└── packages/
    └── db/                   # Shared Mongoose models
        ├── models/           # Claim.ts, DamageReport.ts, PartsPricing.ts
        └── index.ts
```
