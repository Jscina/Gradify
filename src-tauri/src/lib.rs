use crate::database::db::Database;
use tauri::{async_runtime, Manager};
use tauri_plugin_fs::FsExt;
use tokio::{fs, sync::Mutex};

mod database {
    pub mod db;
    pub mod models;
}

mod commands {
    pub mod assignments;
    pub mod classes;
    pub mod grades;
    pub mod overall_grades;
    pub mod student_classes;
    pub mod students;
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

            let exe_path = std::env::current_exe().expect("Can't get exe path");
            let install_dir = exe_path
                .parent()
                .expect("Can't find parent dir")
                .to_path_buf();
            let db_path = install_dir.join("db.sqlite");

            scope
                .allow_directory(&install_dir, true)
                .expect("Can't allow install dir");

            async_runtime::block_on(async {
                if !db_path.exists() {
                    fs::write(&db_path, b"")
                        .await
                        .expect("Can't create db file");
                }

                let db_url = format!("sqlite://{}", db_path.display());
                let db = Database::new(&db_url).await;
                let state = AppState::new(db);
                app.manage(Mutex::new(state));
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::students::create_student,
            commands::students::get_student,
            commands::students::get_all_students,
            commands::students::update_student,
            commands::students::delete_student,
            commands::grades::create_grade,
            commands::grades::get_grade,
            commands::grades::get_all_grades,
            commands::grades::update_grade,
            commands::grades::delete_grade,
            commands::classes::create_class,
            commands::classes::get_class,
            commands::classes::get_all_classes,
            commands::classes::update_class,
            commands::classes::delete_class,
            commands::assignments::create_assignment,
            commands::assignments::get_assignment,
            commands::assignments::get_all_assignments,
            commands::assignments::update_assignment,
            commands::assignments::delete_assignment,
            commands::student_classes::enroll_student,
            commands::student_classes::get_enrollments,
            commands::student_classes::unenroll_student,
            commands::overall_grades::get_overall_grades
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
