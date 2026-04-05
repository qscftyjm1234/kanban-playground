-- Fix schema drift for Kanban Board (Standard MySQL 8.0 syntax)
USE kanban_db;

-- 1. Upgrade Tasks table
-- We verify existence manually or just run and ignore errors if they exist.
-- To be safe, we'll just run the additions.
ALTER TABLE Tasks 
ADD COLUMN SortOrder double NOT NULL DEFAULT 0.0,
ADD COLUMN CreatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
ADD COLUMN UpdatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);

-- Ensure BoardId is synced
UPDATE Tasks SET BoardId = 'ff652609-0c67-40d3-a947-80902b60a5f8' WHERE BoardId IS NULL;
ALTER TABLE Tasks MODIFY COLUMN BoardId char(36) NOT NULL;

-- Add Foreign Key
ALTER TABLE Tasks ADD CONSTRAINT FK_Tasks_Boards_BoardId FOREIGN KEY (BoardId) REFERENCES Boards(Id) ON DELETE CASCADE;

-- 2. Create ChecklistItems
CREATE TABLE IF NOT EXISTS ChecklistItems (
    Id char(36) NOT NULL PRIMARY KEY,
    TaskId char(36) NOT NULL,
    Title varchar(200) NOT NULL,
    IsCompleted tinyint(1) NOT NULL DEFAULT 0,
    SortOrder int NOT NULL DEFAULT 0,
    CONSTRAINT FK_ChecklistItems_Tasks_TaskId FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

-- 3. Create KanbanTaskLabel (Join table)
CREATE TABLE IF NOT EXISTS KanbanTaskLabel (
    LabelsId char(36) NOT NULL,
    TasksId char(36) NOT NULL,
    PRIMARY KEY (LabelsId, TasksId),
    CONSTRAINT FK_KanbanTaskLabel_Labels_LabelsId FOREIGN KEY (LabelsId) REFERENCES Labels(Id) ON DELETE CASCADE,
    CONSTRAINT FK_KanbanTaskLabel_Tasks_TasksId FOREIGN KEY (TasksId) REFERENCES Tasks(Id) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;
