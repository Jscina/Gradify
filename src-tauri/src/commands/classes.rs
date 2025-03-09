use crate::{database::models::Class, AppState};
use tauri::State;
use tokio::sync::Mutex;

#[tauri::command(async, rename_all = "snake_case")]
pub async fn create_class(
    state: State<'_, Mutex<AppState>>,
    class_name: String,
    description: Option<String>,
) -> Result<Class, String> {
    let state = state.lock().await;

    let result = sqlx::query(
        "INSERT INTO CLASSES (CLASS_NAME, DESCRIPTION)
         VALUES (?, ?)",
    )
    .bind(&class_name)
    .bind(&description)
    .execute(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;

    let id = result.last_insert_rowid();

    let class =
        sqlx::query_as::<_, Class>("SELECT ID, CLASS_NAME, DESCRIPTION FROM CLASSES WHERE ID = ?")
            .bind(id)
            .fetch_one(&state.db.pool)
            .await
            .map_err(|e| e.to_string())?;

    Ok(class)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn get_class(state: State<'_, Mutex<AppState>>, id: i64) -> Result<Class, String> {
    let state = state.lock().await;
    let class =
        sqlx::query_as::<_, Class>("SELECT ID, CLASS_NAME, DESCRIPTION FROM CLASSES WHERE ID = ?")
            .bind(id)
            .fetch_one(&state.db.pool)
            .await
            .map_err(|e| e.to_string())?;
    Ok(class)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn get_all_classes(state: State<'_, Mutex<AppState>>) -> Result<Vec<Class>, String> {
    let state = state.lock().await;
    let classes = sqlx::query_as::<_, Class>("SELECT ID, CLASS_NAME, DESCRIPTION FROM CLASSES")
        .fetch_all(&state.db.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(classes)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn update_class(
    state: State<'_, Mutex<AppState>>,
    id: i64,
    class_name: String,
    description: Option<String>,
) -> Result<Class, String> {
    let state = state.lock().await;

    sqlx::query(
        "UPDATE CLASSES
         SET CLASS_NAME = ?, DESCRIPTION = ?
         WHERE ID = ?",
    )
    .bind(&class_name)
    .bind(&description)
    .bind(id)
    .execute(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;

    let class =
        sqlx::query_as::<_, Class>("SELECT ID, CLASS_NAME, DESCRIPTION FROM CLASSES WHERE ID = ?")
            .bind(id)
            .fetch_one(&state.db.pool)
            .await
            .map_err(|e| e.to_string())?;

    Ok(class)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn delete_class(state: State<'_, Mutex<AppState>>, id: i64) -> Result<(), String> {
    let state = state.lock().await;
    sqlx::query("DELETE FROM CLASSES WHERE ID = ?")
        .bind(id)
        .execute(&state.db.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
