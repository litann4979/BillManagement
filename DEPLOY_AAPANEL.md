# Deploy BillCollection on Nginx with aaPanel

This guide explains how to run this Laravel project on a server using **aaPanel** (and Nginx).

---

## 1. Upload the project

- Upload the full project (e.g. via Git clone or SFTP) to a directory such as:
  - `/www/wwwroot/pdpm.nexprosolution.com/`
- Do **not** put the project inside `public_html` of another site. Use a dedicated folder for this app.

---

## 2. Add a website in aaPanel

1. In aaPanel: **Website** → **Add site**
2. **Domain:** `pdpm.nexprosolution.com` (or your domain)
3. **Root directory (important):** set to the **`public`** folder of the project:
   ```text
   /www/wwwroot/pdpm.nexprosolution.com/public
   ```
   If you set root to the project root (without `/public`), you will get **404 Not Found** from Nginx.
4. **PHP version:** 8.1 or 8.2 (match your local Laravel/PHP)
5. Create the site.

---

## 3. Fix Nginx config (if needed)

aaPanel may set `root` to the project root. It **must** point to `public`.

1. **Website** → your site → **Settings** → **Config file** (or **Nginx**).
2. Ensure inside the `server { ... }` block you have:

```nginx
server {
    listen 80;
    server_name pdpm.nexprosolution.com;
    root /www/wwwroot/pdpm.nexprosolution.com/public;   # must end with /public

    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/tmp/php-cgi-81.sock;   # use your PHP version socket from aaPanel
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

3. Get the correct PHP-FPM socket from aaPanel: **App Store** → **PHP 8.1** → **Settings** → **Config**, or **Website** → **PHP version**; socket is often like `/tmp/php-cgi-81.sock` or similar.
4. Save and **Nginx** → **Reload** (or **Service** → **Nginx** → **Reload**).

---

## 4. PHP settings in aaPanel

1. **App Store** → **PHP 8.1** (or your version) → **Settings** → **Disable functions**: remove `putenv`, `proc_open`, `symlink` if you need queue and storage link.
2. **Install extensions** (if not already): `fileinfo`, `openssl`, `pdo_mysql`, `mbstring`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `curl`.

---

## 5. Laravel setup on the server

SSH into the server and run (paths adjusted if yours differ):

```bash
cd /www/wwwroot/pdpm.nexprosolution.com
```

- **Environment**
  ```bash
  cp .env.example .env
  php artisan key:generate
  ```
  Edit `.env`: set `APP_URL`, `DB_*`, `QUEUE_CONNECTION=database` (or `redis` if you use Redis).

- **Dependencies**
  ```bash
  composer install --no-dev --optimize-autoloader
  npm ci
  npm run build
  ```

- **Permissions** (user is often `www` in aaPanel)
  ```bash
  chown -R www:www /www/wwwroot/pdpm.nexprosolution.com
  chmod -R 755 storage bootstrap/cache
  chmod -R 775 storage bootstrap/cache   # if www must write
  ```

- **Database and cache**
  ```bash
  php artisan migrate --force
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  ```

- **Storage link** (for uploads and imports)
  ```bash
  php artisan storage:link
  ```

---

## 6. How the project “works” in aaPanel

- **Web requests:**  
  User visits `https://pdpm.nexprosolution.com/admin/consumers` → Nginx (root = `.../public`) → `try_files` → `index.php` → PHP-FPM runs Laravel → Laravel routes and serves the app (Inertia + your controllers).

- **Consumer import (Excel):**  
  Upload is handled by **ConsumerController** → file is stored under `storage/app/imports` → **ConsumersImport** is **queued** (Laravel queue). For the import to actually run, a **queue worker** must be running (see below).

---

## 7. Queue worker (required for consumer import)

Your consumer import uses **queued jobs** (`ConsumersImport` implements `ShouldQueue`). If no worker is running, the import will stay in “queued” and never process.

In aaPanel:

1. **App Store** → **Supervisor** (install if not installed).
2. **Supervisor** → **Add daemon** (or **Add supervisor**).
3. Configure:
   - **Name:** `pdpm-queue`
   - **Run user:** `www`
   - **Run directory:** `/www/wwwroot/pdpm.nexprosolution.com`
   - **Start command:**
     ```bash
     php artisan queue:work database --sleep=3 --tries=3 --max-time=3600
     ```
   - **Processes:** `1` (or 2 if you want parallel workers).
4. **Confirm** and **Start**.

So in aaPanel:

- **Nginx + PHP** serve the Laravel app (website runs).
- **Supervisor + `php artisan queue:work`** run the queue (consumer import jobs run).

---

## 8. Optional: Cron for scheduler

If you use Laravel scheduler (`routes/console.php`):

1. **Cron** in aaPanel (or `crontab -e` for `www` or root):
   ```text
   * * * * * cd /www/wwwroot/pdpm.nexprosolution.com && php artisan schedule:run >> /dev/null 2>&1
   ```

---

## 9. SSL (HTTPS)

In aaPanel: **Website** → your site → **SSL** → **Let’s Encrypt** (or upload your certificate). After SSL, Nginx will listen on 443 and redirect 80 → 443 if you enable that option.

---

## 10. Checklist

| Step | Action |
|------|--------|
| 1 | Project uploaded to e.g. `/www/wwwroot/pdpm.nexprosolution.com/` |
| 2 | Site added in aaPanel with **root** = `.../public` |
| 3 | Nginx config: `root` = `.../public`, `try_files` and `location ~ \.php$` as above |
| 4 | `.env` created, `APP_KEY` generated, `DB_*` and `APP_URL` set |
| 5 | `composer install`, `npm run build`, `storage:link` |
| 6 | `storage` and `bootstrap/cache` writable by PHP (user `www`) |
| 7 | Migrations run; config/route/view cached |
| 8 | Supervisor daemon running `php artisan queue:work database` |
| 9 | (Optional) Cron for `schedule:run`; SSL enabled |

After this, the project works on Nginx in aaPanel: the site is served by Nginx + PHP, and consumer import runs via the queue worker.
