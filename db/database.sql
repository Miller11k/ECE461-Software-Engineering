-- Update the function to check if a dependency is internal based on predefined internal domain
-- The domain could be stored in a constants table or a config file within your project
CREATE FUNCTION is_internal_dependency(dependency_url VARCHAR)
RETURNS BOOLEAN
LANGUAGE SQL
AS $$
DECLARE
    internal_domain VARCHAR(255);
BEGIN
    -- Assume the internal domain is stored in the 'constants' table
    SELECT value INTO internal_domain FROM constants WHERE key = 'internal_domain';

    -- Check if the URL contains the internal domain from the constants
    IF dependency_url LIKE '%' || internal_domain || '%' THEN
        -- If the URL contains the internal domain, return true
        RETURN TRUE;
    ELSE
        -- Otherwise, return false
        RETURN FALSE;
    END IF;
END;
$$;

-- Example usage
-- SELECT is_internal_dependency('https://internal.acme.com/package/dependency1');
-- This would return true.
-- SELECT is_internal_dependency('https://npmjs.com/package/dependency2');
-- This would return false.

-- 1. Create a table to store packages, including their file location and type (public or internal)
CREATE TABLE packages (
    package_id SERIAL PRIMARY KEY,    -- Unique identifier for each package
    package_name VARCHAR(255) NOT NULL,  -- Name of the package
    file_location VARCHAR(512) NOT NULL, -- Location of the file in the system (e.g., path or URL)
    is_internal BOOLEAN DEFAULT FALSE,   -- Boolean to indicate if the package is internal (true) or public (false)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of when the package was added
);

-- 2. Create a table to store dependencies of each package
-- Each dependency can be linked to a package through the foreign key (package_id)
CREATE TABLE dependencies (
    dependency_id SERIAL PRIMARY KEY,       -- Unique identifier for each dependency
    package_id INT REFERENCES packages(package_id), -- Foreign key to the associated package
    dependency_url VARCHAR(512) NOT NULL,   -- The URL or location of the dependency (e.g., npm or internal registry)
    is_internal BOOLEAN DEFAULT FALSE,      -- Boolean to indicate if the dependency is internal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of when the dependency was added
);

-- 3. Create a table to store metrics for each package
-- The metrics map directly to the TypeScript files like busFactor.ts, correctness.ts, etc.
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

-- 4. Create a table to store the scores and latencies for each package's metrics
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
https://github.com/cloudinary/cloudinary_npm

-- Insert an internal package
INSERT INTO packages (package_name, file_location, is_internal)
VALUES ('acme-utils', 'https://internal.acme.com/packages/acme-utils.zip', TRUE);

-- Insert dependencies for the lodash package
INSERT INTO dependencies (package_id, dependency_url, is_internal)
VALUES (1, 'https://npmjs.com/package/underscore', FALSE);

-- Insert dependencies for the internal package
INSERT INTO dependencies (package_id, dependency_url, is_internal)
VALUES (2, 'https://internal.acme.com/package/acme-logger', TRUE);

-- Insert metrics for lodash
INSERT INTO metrics (package_id, ramp_up_time, bus_factor, correctness, license_compatibility, maintainability)
VALUES (1, 0.8, 0.6, 0.9, 1.0, 0.85);

-- Insert scores and latency data for lodash
INSERT INTO scores (package_id, net_score, ramp_up_latency, bus_factor_latency, correctness_latency, license_latency, maintainability_latency)
VALUES (1, 0.9, 0.005, 0.007, 0.006, 0.003, 0.008);

-- Insert metrics for the internal package
INSERT INTO metrics (package_id, ramp_up_time, bus_factor, correctness, license_compatibility, maintainability)
VALUES (2, 0.9, 0.7, 0.95, 1.0, 0.92);

-- Insert scores and latency data for the internal package
INSERT INTO scores (package_id, net_score, ramp_up_latency, bus_factor_latency, correctness_latency, license_latency, maintainability_latency)
VALUES (2, 0.95, 0.004, 0.006, 0.005, 0.002, 0.007);

-- Select query to fetch all data related to a package
-- This query joins the packages, dependencies, metrics, and scores to give a full overview
SELECT 
    p.package_name, 
    p.file_location, 
    p.is_internal, 
    d.dependency_url, 
    d.is_internal AS dependency_internal, 
    m.ramp_up_time, 
    m.bus_factor, 
    m.correctness, 
    m.license_compatibility, 
    m.maintainability, 
    s.net_score, 
    s.ramp_up_latency, 
    s.bus_factor_latency, 
    s.correctness_latency, 
    s.license_latency, 
    s.maintainability_latency
FROM 
    packages p
LEFT JOIN dependencies d ON p.package_id = d.package_id
LEFT JOIN metrics m ON p.package_id = m.package_id
LEFT JOIN scores s ON p.package_id = s.package_id;
