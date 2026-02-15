import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1680000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS pre_applications (
        id VARCHAR(36) PRIMARY KEY,
        requestorName VARCHAR(100) NOT NULL,
        dob DATE NOT NULL,
        businessName VARCHAR(200) NOT NULL,
        type ENUM('Business','Event','Freelancer') NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(200) NOT NULL,
        budget INT NOT NULL,
        category ENUM('Food','Alcohol','Entertainment','Services','Security','Transportation') NOT NULL,
        status ENUM('PendingReview','FormalReview','Quarantined','Rejected','BoardReview','CommissionerReview') DEFAULT 'PendingReview',
        history JSON NULL,
        createdBy VARCHAR(100) NOT NULL,
        createdByGrade TINYINT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS formal_reviews (
        id VARCHAR(36) PRIMARY KEY,
        preApplicationId VARCHAR(36) NOT NULL,
        meetsCityGoals TINYINT NULL,
        locationValid ENUM('Yes','No','Possibly') NULL,
        mloLink VARCHAR(500) NULL,
        costEstimate INT NULL,
        timeframeDays INT NULL,
        passedBackgroundCheck TINYINT NULL,
        status ENUM('Pending','Completed','SentBack') DEFAULT 'Pending',
        reviewedBy VARCHAR(100) NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (preApplicationId) REFERENCES pre_applications(id) ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id VARCHAR(36) PRIMARY KEY,
        sourcePreAppId VARCHAR(36) NOT NULL,
        name VARCHAR(200) NOT NULL,
        type ENUM('Business','Event','Freelancer') NOT NULL,
        data JSON NOT NULL,
        active TINYINT DEFAULT 1,
        taxRate DECIMAL(5,2) DEFAULT 0,
        expiry DATETIME NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS inspections (
        id VARCHAR(36) PRIMARY KEY,
        targetId VARCHAR(36) NOT NULL,
        targetType ENUM('Business','Event') NOT NULL,
        justification ENUM('For Cause','Random','Scheduled','PD Requested') NOT NULL,
        notes TEXT NOT NULL,
        status ENUM('Pending','Quarantined','Completed') DEFAULT 'Pending',
        inspectorId VARCHAR(100) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS pd_requests (
        id VARCHAR(36) PRIMARY KEY,
        requestedBy VARCHAR(100) NOT NULL,
        targetId VARCHAR(36) NOT NULL,
        targetType ENUM('Business','Event') NOT NULL,
        reason TEXT NULL,
        status ENUM('Pending','Approved','Denied','Quarantined') DEFAULT 'Pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS actions_taken (
        id VARCHAR(36) PRIMARY KEY,
        inspectionId VARCHAR(36) NOT NULL,
        inspectionSnapshot JSON NOT NULL,
        action VARCHAR(200) NOT NULL,
        performedBy VARCHAR(100) NOT NULL,
        performedByGrade TINYINT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id VARCHAR(36) PRIMARY KEY,
        entityType VARCHAR(100) NOT NULL,
        entityId VARCHAR(36) NOT NULL,
        action VARCHAR(100) NOT NULL,
        performedBy VARCHAR(100) NOT NULL,
        performedByGrade TINYINT NOT NULL,
        details JSON NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS streets (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(100) NOT NULL,
        name VARCHAR(200) NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS formal_reviews;`);
    await queryRunner.query(`DROP TABLE IF EXISTS pre_applications;`);
    await queryRunner.query(`DROP TABLE IF EXISTS businesses;`);
    await queryRunner.query(`DROP TABLE IF EXISTS inspections;`);
    await queryRunner.query(`DROP TABLE IF EXISTS pd_requests;`);
    await queryRunner.query(`DROP TABLE IF EXISTS actions_taken;`);
    await queryRunner.query(`DROP TABLE IF EXISTS logs;`);
    await queryRunner.query(`DROP TABLE IF EXISTS streets;`);
  }
}
