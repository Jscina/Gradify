use sqlx::SqlitePool;
use tauri::{async_runtime, Manager};
use tauri_plugin_fs::FsExt;
use tokio::{fs, sync::Mutex};

struct Database {
    pool: SqlitePool,
}

impl Database {
    async fn new(url: &str) -> Self {
        let pool = SqlitePool::connect(url).await.expect("Can't connect to db");
        sqlx::migrate!("./migrations")
            .run(&pool)
            .await
            .expect("Can't run migrations");
        Self { pool }
    }
}

struct AppState {
    db: Database,
}

impl AppState {
    pub fn new(db: Database) -> Self {
        Self { db }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let scope = app.fs_scope();
            let db_path = app.path().app_data_dir().expect("Can't get app data dir");
            scope
                .allow_directory(&db_path, true)
                .expect("Can't allow db dir");
            async_runtime::block_on(async {
                if !db_path.exists() {
                    fs::create_dir_all(&db_path)
                        .await
                        .expect("Can't create db dir");
                    fs::write(db_path.join("db.sqlite"), b"")
                        .await
                        .expect("Can't create db file");
                }

                let db_url = format!("sqlite://{}/db.sqlite", db_path.display());
                let db = Database::new(db_url.as_str()).await;
                let state = AppState::new(db);
                app.manage(Mutex::new(state));
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
