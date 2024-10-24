-- 1. Create constants table only if it doesn't exist
CREATE TABLE IF NOT EXISTS constants (
    key VARCHAR(255) PRIMARY KEY,  -- Unique key for the configuration (e.g., 'internal_domain')
    value VARCHAR(255) NOT NULL    -- Value associated with the key
);

-- Insert internal domain into the constants table (if it doesn't already exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM constants WHERE key = 'internal_domain') THEN
        INSERT INTO constants (key, value) VALUES ('internal_domain', 'internal.acme.com');
    END IF;
END $$;

-- 2. Drop and recreate the function only if it already exists
DROP FUNCTION IF EXISTS is_internal_dependency;

-- Create function to check if a dependency is internal based on the internal domain from the constants table
CREATE FUNCTION is_internal_dependency(dependency_url VARCHAR)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
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

-- 3. Create the main packages table only if it doesn't exist
CREATE TABLE IF NOT EXISTS packages (
    package_id SERIAL PRIMARY KEY,
    package_name VARCHAR(255) NOT NULL,
    repo_link VARCHAR(512) NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    package_version VARCHAR(50),
    s3_link VARCHAR(512),
    sub_database_link VARCHAR(512),
    net_score DECIMAL(3, 2),
    final_metric DECIMAL(3, 2),
    final_metric_latency DECIMAL(5, 3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create a sub-table for version-specific metrics, latencies, and scores only if it doesn't exist
CREATE TABLE IF NOT EXISTS package_versions (
    version_id SERIAL PRIMARY KEY,
    package_id INT REFERENCES packages(package_id) ON DELETE CASCADE,
    package_version VARCHAR(50) NOT NULL,
    s3_location VARCHAR(512),
    repo_link VARCHAR(512),
    net_score DECIMAL(3, 2),
    metric_1 DECIMAL(3, 2),
    metric_1_latency DECIMAL(5, 3),
    metric_2 DECIMAL(3, 2),
    metric_2_latency DECIMAL(5, 3),
    metric_3 DECIMAL(3, 2),
    metric_3_latency DECIMAL(5, 3),
    final_metric DECIMAL(3, 2),
    final_metric_latency DECIMAL(5, 3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create the dependencies table only if it doesn't exist
CREATE TABLE IF NOT EXISTS dependencies (
    dependency_id SERIAL PRIMARY KEY,
    package_id INT REFERENCES packages(package_id) ON DELETE CASCADE,
    dependency_url VARCHAR(512) NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create a table for metrics only if it doesn't exist
CREATE TABLE IF NOT EXISTS metrics (
    metric_id SERIAL PRIMARY KEY,
    package_id INT REFERENCES packages(package_id) ON DELETE CASCADE,
    ramp_up_time DECIMAL(3, 2),
    bus_factor DECIMAL(3, 2),
    correctness DECIMAL(3, 2),
    license_compatibility DECIMAL(3, 2),
    maintainability DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create a table to store scores only if it doesn't exist
CREATE TABLE IF NOT EXISTS scores (
    score_id SERIAL PRIMARY KEY,
    package_id INT REFERENCES packages(package_id) ON DELETE CASCADE,
    net_score DECIMAL(3, 2),
    ramp_up_latency DECIMAL(5, 3),
    bus_factor_latency DECIMAL(5, 3),
    correctness_latency DECIMAL(5, 3),
    license_latency DECIMAL(5, 3),
    maintainability_latency DECIMAL(5, 3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 8. Example inserts to populate the tables

-- Insert an external package (lodash)
INSERT INTO packages (package_name, repo_link, is_internal, package_version, s3_link, sub_database_link, net_score, final_metric, final_metric_latency)
VALUES ('lodash', 'https://github.com/lodash/lodash', FALSE, '4.17.21', NULL, NULL, 0.9, 0.88, 0.004);

-- Insert a version-specific entry for lodash
INSERT INTO package_versions (package_id, package_version, s3_location, repo_link, net_score, metric_1, metric_1_latency, metric_2, metric_2_latency, metric_3, metric_3_latency, final_metric, final_metric_latency)
VALUES (1, '4.17.21', NULL, 'https://github.com/lodash/lodash', 0.9, 0.8, 0.003, 0.85, 0.004, 0.9, 0.005, 0.88, 0.004);

-- Insert an internal package (acme-utils)
INSERT INTO packages (package_name, repo_link, is_internal, package_version, s3_link, sub_database_link, net_score, final_metric, final_metric_latency)
VALUES ('acme-utils', 'https://internal.acme.com/repo/acme-utils', TRUE, '1.2.0', 's3://internal.acme.com/acme-utils', NULL, 0.95, 0.92, 0.003);

-- Insert a version-specific entry for acme-utils
INSERT INTO package_versions (package_id, package_version, s3_location, repo_link, net_score, metric_1, metric_1_latency, metric_2, metric_2_latency, metric_3, metric_3_latency, final_metric, final_metric_latency)
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

-- Final Queries
-- Query to fetch package information along with dependencies and metrics
SELECT 
    p.package_name, 
    p.repo_link, 
    p.is_internal, 
    p.package_version, 
    p.s3_link, 
    d.dependency_url, 
    d.is_internal AS dependency_internal, 
    m.ramp_up_time, 
    m.bus_factor, 
    m.correctness, 
    m.license_compatibility, 
    m.maintainability
FROM packages p
LEFT JOIN dependencies d ON p.package_id = d.package_id
LEFT JOIN metrics m ON p.package_id = m.package_id;
