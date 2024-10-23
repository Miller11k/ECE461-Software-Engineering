-- 1. Create a constants table to store configurations (e.g., internal domain)
CREATE TABLE constants (
    key VARCHAR(255) PRIMARY KEY,  -- Unique key for the configuration (e.g., 'internal_domain')
    value VARCHAR(255) NOT NULL    -- Value associated with the key
);

-- Insert the internal domain into the constants table (for example purposes)
INSERT INTO constants (key, value) VALUES ('internal_domain', 'internal.acme.com');

-- 2. Create a function to check if a dependency is internal based on the internal domain from the constants table
CREATE FUNCTION is_internal_dependency(dependency_url VARCHAR)
RETURNS BOOLEAN
LANGUAGE SQL
AS $$
DECLARE
    internal_domain VARCHAR(255);
BEGIN
    -- Retrieve the internal domain from the constants table
    SELECT value INTO internal_domain FROM constants WHERE key = 'internal_domain';

    -- Check if the URL contains the internal domain
    IF dependency_url LIKE '%' || internal_domain || '%' THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

-- 3. Create the main packages table with extended fields
CREATE TABLE packages (
    package_id SERIAL PRIMARY KEY,               -- Unique identifier for each package
    package_name VARCHAR(255) NOT NULL,          -- Name of the package
    repo_link VARCHAR(512) NOT NULL,             -- Repository link for the package
    is_internal BOOLEAN DEFAULT FALSE,           -- Boolean to indicate if the package is internal (TRUE) or external (FALSE)
    package_version VARCHAR(50),                 -- Current version of the package (e.g., x.x.y)
    s3_link VARCHAR(512),                        -- S3 bucket link for internal packages
    sub_database_link VARCHAR(512),              -- Link to a sub-database for version-specific data (if applicable)
    net_score DECIMAL(3, 2),                     -- Overall net score for the package (0.0 - 1.0)
    final_metric DECIMAL(3, 2),                  -- Final overall metric score (aggregated)
    final_metric_latency DECIMAL(5, 3),          -- Latency for calculating the final metric score
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the package was added
);

-- 4. Create a sub-table for version-specific metrics, latencies, and scores
CREATE TABLE package_versions (
    version_id SERIAL PRIMARY KEY,               -- Unique identifier for each version entry
    package_id INT REFERENCES packages(package_id), -- Foreign key referencing the main packages table
    package_version VARCHAR(50) NOT NULL,        -- Version number (e.g., 1.0.0, 2.1.3)
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

-- 5. Create a table for package dependencies
CREATE TABLE dependencies (
    dependency_id SERIAL PRIMARY KEY,       -- Unique identifier for each dependency
    package_id INT REFERENCES packages(package_id), -- Foreign key to the associated package
    dependency_url VARCHAR(512) NOT NULL,   -- The URL or location of the dependency (e.g., npm or internal registry)
    is_internal BOOLEAN DEFAULT FALSE,      -- Boolean to indicate if the dependency is internal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of when the dependency was added
);

-- 6. Create a table for metrics (aggregated)
CREATE TABLE metrics (
    metric_id SERIAL PRIMARY KEY,           -- Unique identifier for each metric entry
    package_id INT REFERENCES packages(package_id), -- Foreign key to the associated package
    ramp_up_time DECIMAL(3, 2),             -- Metric for ramp-up time (score between 0 and 1)
    bus_factor DECIMAL(3, 2),               -- Metric for bus factor (score between 0 and 1)
    correctness DECIMAL(3, 2),              -- Metric for correctness (score between 0 and 1)
    license_compatibility DECIMAL(3, 2),    -- Metric for license compatibility (score between 0 and 1)
    maintainability DECIMAL(3, 2),          -- Metric for maintainability (score between 0 and 1)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of when the metrics were recorded
);

-- 7. Create a table to store scores and latencies for metrics
CREATE TABLE scores (
    score_id SERIAL PRIMARY KEY,            -- Unique identifier for each score entry
    package_id INT REFERENCES packages(package_id), -- Foreign key to the associated package
    net_score DECIMAL(3, 2),                -- Net score for the package (between 0 and 1)
    ramp_up_latency DECIMAL(5, 3),          -- Latency in seconds for calculating the ramp-up time metric
    bus_factor_latency DECIMAL(5, 3),       -- Latency in seconds for calculating the bus factor metric
    correctness_latency DECIMAL(5, 3),      -- Latency for calculating correctness
    license_latency DECIMAL(5, 3),          -- Latency in seconds for checking license compatibility
    maintainability_latency DECIMAL(5, 3),  -- Latency for maintainability checks
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of when the score and latency were recorded
);

-- 5. Example inserts to populate the tables
-- Insert a public package
INSERT INTO packages (package_name, file_location, is_internal)
VALUES ('lodash', '/path/to/lodash.zip', FALSE);

-- Insert a version-specific entry for lodash
INSERT INTO package_versions (package_id, version, s3_location, repo_link, net_score, metric_1, metric_1_latency, metric_2, metric_2_latency, metric_3, metric_3_latency, final_metric, final_metric_latency)
VALUES (1, '4.17.21', NULL, 'https://github.com/lodash/lodash', 0.9, 0.8, 0.003, 0.85, 0.004, 0.9, 0.005, 0.88, 0.004);

-- Insert an internal package (acme-utils)
INSERT INTO packages (package_name, repo_link, is_internal, version, s3_link, sub_database_link, net_score, final_metric, final_metric_latency)
VALUES ('acme-utils', 'https://internal.acme.com/repo/acme-utils', TRUE, '1.2.0', 's3://internal.acme.com/acme-utils', NULL, 0.95, 0.92, 0.003);

-- Insert a version-specific entry for acme-utils
INSERT INTO package_versions (package_id, version, s3_location, repo_link, net_score, metric_1, metric_1_latency, metric_2, metric_2_latency, metric_3, metric_3_latency, final_metric, final_metric_latency)
VALUES (2, '1.2.0', 's3://internal.acme.com/acme-utils', 'https://internal.acme.com/repo/acme-utils', 0.95, 0.9, 0.002, 0.85, 0.003, 0.92, 0.002, 0.92, 0.003);

-- Insert dependencies for lodash
INSERT INTO dependencies (package_id, dependency_url, is_internal)
VALUES (1, 'https://npmjs.com/package/underscore', FALSE);

-- Insert dependencies for acme-utils
INSERT INTO dependencies (package_id, dependency_url, is_internal)
VALUES (2, 'https://internal.acme.com/package/acme-logger', TRUE);

-- Insert aggregated metrics for lodash
INSERT INTO metrics (package_id, ramp_up_time, bus_factor, correctness, license_compatibility, maintainability)
VALUES (1, 0.8, 0.6, 0.9, 1.0, 0.85);

-- Insert aggregated scores and latencies for lodash
INSERT INTO scores (package_id, net_score, ramp_up_latency, bus_factor_latency, correctness_latency, license_latency, maintainability_latency)
VALUES (1, 0.9, 0.003, 0.004, 0.005, 0.002, 0.003);


-- Create a unified table for packages with all necessary fields
CREATE TABLE packages_combined (
    package_id SERIAL PRIMARY KEY,                 -- Unique identifier for each package
    package_name VARCHAR(255) NOT NULL,            -- Name of the package
    repo_link VARCHAR(512) NOT NULL,               -- Repository link for the package
    is_internal BOOLEAN DEFAULT FALSE,             -- Boolean to indicate if the package is internal (TRUE) or external (FALSE)
    package_version VARCHAR(50) NOT NULL,          -- Current version of the package (e.g., x.x.y)
    s3_link VARCHAR(512),                          -- S3 bucket link for internal packages
    sub_database_link VARCHAR(512),                -- Link to a sub-database for version-specific data (if applicable)
    net_score DECIMAL(3, 2),                       -- Overall net score for the package (0.0 - 1.0)
    final_metric DECIMAL(3, 2),                    -- Final overall metric score (aggregated)
    final_metric_latency DECIMAL(5, 3),            -- Latency for calculating the final metric score
    ramp_up_time DECIMAL(3, 2),                    -- Metric for ramp-up time (score between 0 and 1)
    ramp_up_latency DECIMAL(5, 3),                 -- Latency in seconds for ramp-up time metric
    bus_factor DECIMAL(3, 2),                      -- Metric for bus factor (score between 0 and 1)
    bus_factor_latency DECIMAL(5, 3),              -- Latency in seconds for bus factor metric
    correctness DECIMAL(3, 2),                     -- Metric for correctness (score between 0 and 1)
    correctness_latency DECIMAL(5, 3),             -- Latency in seconds for correctness metric
    license_compatibility DECIMAL(3, 2),           -- Metric for license compatibility (score between 0 and 1)
    license_latency DECIMAL(5, 3),                 -- Latency in seconds for license compatibility check
    maintainability DECIMAL(3, 2),                 -- Metric for maintainability (score between 0 and 1)
    maintainability_latency DECIMAL(5, 3),         -- Latency for maintainability checks
    dependency_url VARCHAR(512),                   -- The URL or location of the dependency (e.g., npm or internal registry)
    dependency_is_internal BOOLEAN DEFAULT FALSE,  -- Boolean to indicate if the dependency is internal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp when the package was added
);

-- Example Insertions for testing
INSERT INTO packages_combined (
    package_name, repo_link, is_internal, package_version, s3_link, net_score, final_metric, final_metric_latency, 
    ramp_up_time, ramp_up_latency, bus_factor, bus_factor_latency, correctness, correctness_latency, 
    license_compatibility, license_latency, maintainability, maintainability_latency, dependency_url, dependency_is_internal
)
VALUES (
    'lodash', 'https://github.com/lodash/lodash', FALSE, '4.17.21', NULL, 0.9, 0.88, 0.004, 
    0.8, 0.003, 0.6, 0.004, 0.9, 0.005, 1.0, 0.002, 0.85, 0.003, 'https://npmjs.com/package/underscore', FALSE
);

INSERT INTO packages_combined (
    package_name, repo_link, is_internal, package_version, s3_link, net_score, final_metric, final_metric_latency, 
    ramp_up_time, ramp_up_latency, bus_factor, bus_factor_latency, correctness, correctness_latency, 
    license_compatibility, license_latency, maintainability, maintainability_latency, dependency_url, dependency_is_internal
)
VALUES (
    'acme-utils', 'https://internal.acme.com/repo/acme-utils', TRUE, '1.2.0', 's3://internal.acme.com/acme-utils', 
    0.95, 0.92, 0.003, 0.9, 0.002, 0.85, 0.003, 0.92, 0.002, 0.95, 0.003, 0.85, 0.002, 'https://internal.acme.com/package/acme-logger', TRUE
);
