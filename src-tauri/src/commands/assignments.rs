use crate::{database::models::Assignment, AppState};
use chrono::NaiveDateTime;
use tauri::State;
use tokio::sync::Mutex;

#[tauri::command(async, rename_all = "snake_case")]
pub async fn create_assignment(
    state: State<'_, Mutex<AppState>>,
    class_id: i64,
    assignment_name: String,
    assignment_type: String,
    maximum_score: f64,
    due_date: Option<NaiveDateTime>,
) -> Result<Assignment, String> {
    let state = state.lock().await;

    let result = sqlx::query(
        "INSERT INTO ASSIGNMENTS (CLASS_ID, ASSIGNMENT_NAME, ASSIGNMENT_TYPE, MAXIMUM_SCORE, DUE_DATE)
         VALUES (?, ?, ?, ?, ?)"
    )
    .bind(class_id)
    .bind(&assignment_name)
    .bind(&assignment_type)
    .bind(maximum_score)
    .bind(due_date)
    .execute(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;

    let id = result.last_insert_rowid();

    let assignment = sqlx::query_as::<_, Assignment>(
        "SELECT ID, CLASS_ID, ASSIGNMENT_NAME, ASSIGNMENT_TYPE, MAXIMUM_SCORE, DUE_DATE 
         FROM ASSIGNMENTS
         WHERE ID = ?",
    )
    .bind(id)
    .fetch_one(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(assignment)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn get_assignment(
    state: State<'_, Mutex<AppState>>,
    id: i64,
) -> Result<Assignment, String> {
    let state = state.lock().await;
    let assignment = sqlx::query_as::<_, Assignment>(
        "SELECT ID, CLASS_ID, ASSIGNMENT_NAME, ASSIGNMENT_TYPE, MAXIMUM_SCORE, DUE_DATE 
         FROM ASSIGNMENTS
         WHERE ID = ?",
    )
    .bind(id)
    .fetch_one(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(assignment)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn get_all_assignments(
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<Assignment>, String> {
    let state = state.lock().await;
    let assignments = sqlx::query_as::<_, Assignment>(
        "SELECT ID, CLASS_ID, ASSIGNMENT_NAME, ASSIGNMENT_TYPE, MAXIMUM_SCORE, DUE_DATE 
         FROM ASSIGNMENTS",
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(assignments)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn update_assignment(
    state: State<'_, Mutex<AppState>>,
    id: i64,
    class_id: i64,
    assignment_name: String,
    assignment_type: String,
    maximum_score: f64,
    due_date: Option<NaiveDateTime>,
) -> Result<Assignment, String> {
    let state = state.lock().await;

    sqlx::query(
        "UPDATE ASSIGNMENTS
         SET CLASS_ID = ?, ASSIGNMENT_NAME = ?, ASSIGNMENT_TYPE = ?, MAXIMUM_SCORE = ?, DUE_DATE = ?
         WHERE ID = ?",
    )
    .bind(class_id)
    .bind(&assignment_name)
    .bind(&assignment_type)
    .bind(maximum_score)
    .bind(due_date)
    .bind(id)
    .execute(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;

    let assignment = sqlx::query_as::<_, Assignment>(
        "SELECT ID, CLASS_ID, ASSIGNMENT_NAME, ASSIGNMENT_TYPE, MAXIMUM_SCORE, DUE_DATE 
         FROM ASSIGNMENTS
         WHERE ID = ?",
    )
    .bind(id)
    .fetch_one(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(assignment)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn delete_assignment(state: State<'_, Mutex<AppState>>, id: i64) -> Result<(), String> {
    let state = state.lock().await;
    sqlx::query("DELETE FROM ASSIGNMENTS WHERE ID = ?")
        .bind(id)
        .execute(&state.db.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
