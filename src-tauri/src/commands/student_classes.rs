use crate::{database::models::StudentClass, AppState};
use tauri::State;
use tokio::sync::Mutex;

#[tauri::command(async, rename_all = "snake_case")]
pub async fn enroll_student(
    state: State<'_, Mutex<AppState>>,
    student_id: i64,
    class_id: i64,
) -> Result<StudentClass, String> {
    let state = state.lock().await;
    let enrollment = sqlx::query_as::<_, StudentClass>(
        "INSERT INTO STUDENT_CLASSES (STUDENT_ID, CLASS_ID)
         VALUES (?, ?)
         RETURNING STUDENT_ID, CLASS_ID",
    )
    .bind(student_id)
    .bind(class_id)
    .fetch_one(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(enrollment)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn get_enrollments(
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<StudentClass>, String> {
    let state = state.lock().await;
    let enrollments =
        sqlx::query_as::<_, StudentClass>("SELECT STUDENT_ID, CLASS_ID FROM STUDENT_CLASSES")
            .fetch_all(&state.db.pool)
            .await
            .map_err(|e| e.to_string())?;
    Ok(enrollments)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn unenroll_student(
    state: State<'_, Mutex<AppState>>,
    student_id: i64,
    class_id: i64,
) -> Result<(), String> {
    let state = state.lock().await;
    sqlx::query("DELETE FROM STUDENT_CLASSES WHERE STUDENT_ID = ? AND CLASS_ID = ?")
        .bind(student_id)
        .bind(class_id)
        .execute(&state.db.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
