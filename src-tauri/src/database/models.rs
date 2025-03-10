use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Student {
    #[sqlx(rename = "ID")]
    pub id: i64,
    #[sqlx(rename = "FIRST_NAME")]
    pub first_name: String,
    #[sqlx(rename = "LAST_NAME")]
    pub last_name: String,
    #[sqlx(rename = "EMAIL")]
    pub email: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Class {
    #[sqlx(rename = "ID")]
    pub id: i64,
    #[sqlx(rename = "CLASS_NAME")]
    pub class_name: String,
    #[sqlx(rename = "DESCRIPTION")]
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct StudentClass {
    #[sqlx(rename = "STUDENT_ID")]
    pub student_id: i64,
    #[sqlx(rename = "CLASS_ID")]
    pub class_id: i64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Assignment {
    #[sqlx(rename = "ID")]
    pub id: i64,
    #[sqlx(rename = "CLASS_ID")]
    pub class_id: i64,
    #[sqlx(rename = "ASSIGNMENT_NAME")]
    pub assignment_name: String,
    #[sqlx(rename = "ASSIGNMENT_TYPE")]
    pub assignment_type: String,
    #[sqlx(rename = "MAXIMUM_SCORE")]
    pub maximum_score: f64,
    #[sqlx(rename = "DUE_DATE")]
    pub due_date: Option<NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Grade {
    #[sqlx(rename = "STUDENT_ID")]
    pub student_id: i64,
    #[sqlx(rename = "ASSIGNMENT_ID")]
    pub assignment_id: i64,
    #[sqlx(rename = "SCORE")]
    pub score: f64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct OverallGrade {
    #[sqlx(rename = "STUDENT_ID")]
    pub student_id: i64,
    #[sqlx(rename = "CLASS_ID")]
    pub class_id: i64,
    #[sqlx(rename = "PERCENTAGE")]
    pub percentage: f64,
    #[sqlx(rename = "LETTER_GRADE")]
    pub letter_grade: String,
}
