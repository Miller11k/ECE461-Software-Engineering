-- Main table: stores the core details for each package
CREATE TABLE packages (
    package_id SERIAL PRIMARY KEY,               -- Unique identifier for each package
    package_name VARCHAR(255) NOT NULL,          -- Name of the package
    repo_link VARCHAR(512) NOT NULL,             -- Repository link for the package
    is_internal BOOLEAN DEFAULT FALSE,           -- Boolean to indicate if the package is internal (TRUE) or external (FALSE)
    version VARCHAR(50),                         -- Current version of the package (e.g., x.x.y)
    s3_link VARCHAR(512),                        -- S3 bucket link for internal packages
    sub_database_link VARCHAR(512),              -- Link to a sub-database for version-specific data (if applicable)
    net_score DECIMAL(3, 2),                     -- Overall net score for the package (0.0 - 1.0)
    final_metric DECIMAL(3, 2),                  -- Final overall metric score (aggregated)
    final_metric_latency DECIMAL(5, 3),          -- Latency for calculating the final metric score
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the package was added
);

-- Sub-table: stores version-specific metrics, latencies, and scores
CREATE TABLE package_versions (
    version_id SERIAL PRIMARY KEY,               -- Unique identifier for each version entry
    package_id INT REFERENCES packages(package_id), -- Foreign key referencing the main packages table
    version VARCHAR(50) NOT NULL,                -- Version number (e.g., 1.0.0, 2.1.3)
    s3_location VARCHAR(512),                    -- S3 location for this version (if applicable)
    repo_link VARCHAR(512),                      -- Repository link for this version
    net_score DECIMAL(3, 2),                     -- Net score for this version
    metric_1 DECIMAL(3, 2),                      -- Value for Metric 1 (e.g., ramp-up time)
    metric_1_latency DECIMAL(5, 3),              -- Latency in seconds for Metric 1
    metric_2 DECIMAL(3, 2),                      -- Value for Metric 2 (e.g., bus factor)
    metric_2_latency DECIMAL(5, 3),              -- Latency in seconds for Metric 2
    metric_3 DECIMAL(3, 2),                      -- Value for another metric (e.g., correctness)
    metric_3_latency DECIMAL(5, 3),              -- Latency in seconds for Metric 3
    final_metric DECIMAL(3, 2),                  -- Final metric score for this version
    final_metric_latency DECIMAL(5, 3),          -- Latency for calculating the final metric score
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the version-specific data was added
);

-- Example inserts to populate the tables

-- Insert a package (e.g., lodash, an external package)
INSERT INTO packages (package_name, repo_link, is_internal, version, s3_link, sub_database_link, net_score, final_metric, final_metric_latency)
VALUES ('lodash', 'https://github.com/lodash/lodash', FALSE, '4.17.21', NULL, NULL, 0.9, 0.88, 0.004);

-- Insert a package version for lodash
INSERT INTO package_versions (package_id, version, s3_location, repo_link, net_score, metric_1, metric_1_latency, metric_2, metric_2_latency, metric_3, metric_3_latency, final_metric, final_metric_latency)
VALUES (1, '4.17.21', NULL, 'https://github.com/lodash/lodash', 0.9, 0.8, 0.003, 0.85, 0.004, 0.9, 0.005, 0.88, 0.004);

-- Insert an internal package (e.g., acme-utils)
INSERT INTO packages (package_name, repo_link, is_internal, version, s3_link, sub_database_link, net_score, final_metric, final_metric_latency)
VALUES ('acme-utils', 'https://internal.acme.com/repo/acme-utils', TRUE, '1.2.0', 's3://internal.acme.com/acme-utils', NULL, 0.95, 0.92, 0.003);

-- Insert a package version for acme-utils
INSERT INTO package_versions (package_id, version, s3_location, repo_link, net_score, metric_1, metric_1_latency, metric_2, metric_2_latency, metric_3, metric_3_latency, final_metric, final_metric_latency)
VALUES (2, '1.2.0', 's3://internal.acme.com/acme-utils/v1.2.0', 'https://internal.acme.com/repo/acme-utils', 0.95, 0.92, 0.002, 0.89, 0.003, 0.93, 0.002, 0.92, 0.003);

-- Select query to fetch all data related to a package, including version-specific metrics
SELECT 
    p.package_name, 
    p.repo_link, 
    p.is_internal, 
    p.version, 
    p.s3_link, 
    v.version, 
    v.s3_location, 
    v.net_score, 
    v.metric_1, 
    v.metric_1_latency, 
    v.metric_2, 
    v.metric_2_latency, 
    v.metric_3, 
    v.metric_3_latency, 
    v.final_metric, 
    v.final_metric_latency
FROM 
    packages p
LEFT JOIN package_versions v ON p.package_id = v.package_id;
