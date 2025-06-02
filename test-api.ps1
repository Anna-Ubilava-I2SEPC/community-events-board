# API Testing Script for Task 4.4
Write-Host "=== Testing Community Events Board API ===" -ForegroundColor Green

# Test 1: Ping endpoint
Write-Host "`n1. Testing Ping Endpoint:" -ForegroundColor Yellow
try {
    $pingResponse = Invoke-WebRequest -Uri "http://localhost:4000/ping"
    Write-Host "✅ Ping successful - Status: $($pingResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($pingResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Ping failed: $_" -ForegroundColor Red
}

# Test 2: GET /events
Write-Host "`n2. Testing GET /events:" -ForegroundColor Yellow
try {
    $getResponse = Invoke-WebRequest -Uri "http://localhost:4000/events"
    Write-Host "✅ GET /events successful - Status: $($getResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($getResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET /events failed: $_" -ForegroundColor Red
}

# Test 3: POST /events (Valid Event)
Write-Host "`n3. Testing POST /events (Valid Event):" -ForegroundColor Yellow
$validEvent = @{
    title = "API Test Event"
    date = "2025-12-25"
    location = "Test Location"
    description = "Created via API testing script"
} | ConvertTo-Json

try {
    $postResponse = Invoke-WebRequest -Uri "http://localhost:4000/events" -Method POST -Body $validEvent -ContentType "application/json"
    Write-Host "✅ POST /events successful - Status: $($postResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($postResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ POST /events failed: $_" -ForegroundColor Red
}

# Test 4: POST /events (Invalid Event - Missing Required Fields)
Write-Host "`n4. Testing POST /events (Invalid Event - Missing Fields):" -ForegroundColor Yellow
$invalidEvent = @{
    title = "Incomplete Event"
    # Missing date and location
} | ConvertTo-Json

try {
    $invalidPostResponse = Invoke-WebRequest -Uri "http://localhost:4000/events" -Method POST -Body $invalidEvent -ContentType "application/json"
    Write-Host "⚠️ POST /events with invalid data should have failed but got: $($invalidPostResponse.StatusCode)" -ForegroundColor Yellow
} catch {
    Write-Host "✅ POST /events correctly rejected invalid data: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
}

# Test 5: GET /events again to verify the new event was added
Write-Host "`n5. Testing GET /events again (should show new event):" -ForegroundColor Yellow
try {
    $finalGetResponse = Invoke-WebRequest -Uri "http://localhost:4000/events"
    Write-Host "✅ Final GET /events successful - Status: $($finalGetResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($finalGetResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Final GET /events failed: $_" -ForegroundColor Red
}

Write-Host "`n=== API Testing Complete ===" -ForegroundColor Green 