# Deploy BillCollection on MilesWeb cPanel

This guide explains how to run this Laravel project on **MilesWeb cPanel** so the site and consumer import work correctly.

---

## 1. Upload the project

- **Option A – Main domain:** Upload the full Laravel project into your home directory, e.g.:
  - `laravel_app/` (contains `app/`, `public/`, `routes/`, etc.)
- **Option B – Subdomain/addon:** Create a folder like `pdpm` or your domain name and upload the project there.

Typical path on MilesWeb cPanel:
- `/home/your_cpanel_username/laravel_app/`  
  or  
- `/home/your_cpanel_username/pdpm.nexprosolution.com/`

Do **not** upload only the contents of `public` into `public_html` and the rest elsewhere in a way that breaks paths. Keep the full Laravel structure in one folder.

---

## 2. Set document root to `public`

Laravel **must** run with the document root pointing to the **`public`** folder. Otherwise you get 404 or “missing bootstrap” errors.

### If this is your main domain

1. In cPanel go to **Domains** → **Domains** (or **Addon Domains** / **Subdomains**).
2. Click your domain (or **Manage**).
3. Find **Document Root** (or **Root Directory**).
4. Change it from `public_html` to the **public** folder of your Laravel app, e.g.:
   - `laravel_app/public`  
   or  
   - `pdpm.nexprosolution.com/public`  
   So the full path is like: `/home/your_cpanel_username/laravel_app/public`
5. Save.

### If this is an addon domain or subdomain

1. **Domains** → **Addon Domains** or **Subdomains**.
2. When creating (or editing) the addon/subdomain, set **Document Root** to:
   - `addon_domain_folder/public`  
   e.g. `pdpm.nexprosolution.com/public`
3. So the web root is `/home/username/pdpm.nexprosolution.com/public`.

After this, Apache will use `public/.htaccess` and send all requests to `index.php`.

---

## 3. Select PHP version (MultiPHP Manager)

1. cPanel → **MultiPHP Manager** (or **Select PHP Version**).
2. Select your **domain** or the path to your app.
3. Choose **PHP 8.1** or **8.2** (match your local Laravel/PHP).
4. Enable extensions Laravel needs:  
   `fileinfo`, `openssl`, `pdo_mysql`, `mbstring`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `curl`.  
   If an extension is missing, enable it from the same screen (or ask MilesWeb to enable it).

---

## 4. Laravel setup via SSH (recommended) or Terminal

If MilesWeb provides **SSH** or cPanel **Terminal**:

```bash
cd ~/laravel_app
# or: cd ~/pdpm.nexprosolution.com
```

- **Environment**
  ```bash
  cp .env.example .env
  php artisan key:generate
  ```
  Edit `.env` (use **File Manager** or **Edit** in cPanel): set `APP_URL`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, and keep `QUEUE_CONNECTION=database` for the import queue.

- **Dependencies**
  ```bash
  composer install --no-dev --optimize-autoloader
  npm ci
  npm run build
  ```
  If `npm` is not available on the server, build locally (`npm run build`) and upload the `public/build` folder (and `public/hot` if you use it).

- **Permissions**
  ```bash
  chmod -R 755 storage bootstrap/cache
  chmod -R 775 storage bootstrap/cache
  ```
  If your web user is different, cPanel often uses your username; adjust if support tells you otherwise.

- **Database and caches**
  ```bash
  php artisan migrate --force
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  php artisan storage:link
  ```

If you **don’t have SSH**: upload a built `public/build`, run `composer install` via **PHP Composer** in cPanel (if available), create `.env` in File Manager, and run `php artisan key:generate` and migrations using **Run Script** or a one-off PHP script that calls Artisan (less ideal; SSH is better).

---

## 5. Run queue worker (required for consumer import)

The consumer Excel import uses **queued jobs**. If no worker is running, imports stay “queued” and never process.

On cPanel you usually don’t have a long-running daemon; use a **cron job** to run the queue worker.

1. cPanel → **Cron Jobs**.
2. **Add New Cron Job**:
   - **Common setting:** e.g. “Every minute” (`* * * * *`) or “Every 5 minutes”.
   - **Command:**
     ```bash
     cd /home/your_cpanel_username/laravel_app && php artisan queue:work database --stop-when-empty --max-time=300
     ```
     Replace `your_cpanel_username` and `laravel_app` (or `pdpm.nexprosolution.com`) with your actual path.

This runs the worker every minute (or every 5 minutes), processes pending jobs, then exits. For busier sites, you can use a shorter interval or ask MilesWeb if they support a persistent worker (e.g. Supervisor).

**Alternative (run worker every minute for 5 minutes):**
```bash
* * * * * cd /home/your_cpanel_username/laravel_app && php artisan queue:work database --stop-when-empty --max-time=300 >> /home/your_cpanel_username/logs/queue.log 2>&1
```
Create `logs` in your home directory if it doesn’t exist.

---

## 6. Optional: Laravel scheduler

If you use the scheduler in `routes/console.php`:

Add another cron job:

- **Schedule:** `* * * * *` (every minute).
- **Command:**
  ```bash
  cd /home/your_cpanel_username/laravel_app && php artisan schedule:run >> /dev/null 2>&1
  ```

---

## 7. Database (MySQL in cPanel)

1. cPanel → **MySQL® Databases**.
2. Create a **database** (e.g. `username_pdpm`).
3. Create a **user** and **password**.
4. **Add User to Database** with **ALL PRIVILEGES**.
5. In `.env` set:
   - `DB_DATABASE=username_pdpm`
   - `DB_USERNAME=username_dbuser`
   - `DB_PASSWORD=your_password`
   - `DB_HOST=localhost`
6. Run migrations (see step 4).

---

## 8. SSL (HTTPS) on MilesWeb

1. cPanel → **SSL/TLS Status** or **Let’s Encrypt™**.
2. Select your domain and issue the certificate.
3. In `.env` set `APP_URL=https://yourdomain.com`.
4. Clear config cache: `php artisan config:cache` (via SSH/Terminal).

---

## 9. Checklist

| Step | Action |
|------|--------|
| 1 | Full Laravel project uploaded (e.g. `~/laravel_app/` or `~/pdpm.nexprosolution.com/`) |
| 2 | Document root set to `.../public` for this domain/subdomain |
| 3 | PHP 8.1 or 8.2 selected with required extensions |
| 4 | `.env` created, `APP_KEY` generated, `DB_*` and `APP_URL` set |
| 5 | `composer install`, `npm run build` (or upload `public/build`), `storage:link` |
| 6 | `storage` and `bootstrap/cache` writable (755/775) |
| 7 | Migrations run; `config:cache`, `route:cache`, `view:cache` |
| 8 | Cron job added for `queue:work database` (so consumer import runs) |
| 9 | (Optional) Cron for `schedule:run`; SSL enabled |

---

## 10. How it works on MilesWeb cPanel

- **Web:** Requests hit Apache with document root = `public`. `.htaccess` sends everything to `index.php`. Laravel serves the app (including `/admin/consumers`).
- **Consumer import:** Upload goes to Laravel; jobs are pushed to the `jobs` table. The **cron** runs `queue:work` periodically, so import jobs are processed and the queue drains.

If something doesn’t work, check: **Error logs** (cPanel → **Errors**), Laravel `storage/logs/laravel.log`, and that the cron command path and user are correct.
