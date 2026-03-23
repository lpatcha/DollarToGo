# Testing DollarToGo WebSockets with Postman

Postman has built-in support for **Socket.io** (which is what we are using). Follow these steps to verify that your real-time notifications are working.

## 1. Setup the Connection
1.  Open Postman and click the **New** button (top left).
2.  Select **Socket.io** (Do *not* select "WebSocket").
3.  In the URL bar, enter: `http://localhost:4000`
4.  Navigate to the **Auth** tab:
    *   Since our server requires authentication, we need to pass the JWT.
    *   In the **Auth** tab, choose your method (usually we send it in the `handshake`).
    *   Alternatively, go to the **Settings** or **Handshake** tab and add an [auth](file:///Users/lokeshpatchala/Documents/personal/DollarToGo/apps/api/src/middleware/auth/authMiddleware.ts#16-45) object:
        ```json
        {
          "token": "YOUR_JWT_TOKEN_HERE"
        }
        ```
5.  Click **Connect**. You should see a green "Connected" status in the console.

---

## 2. Testing "The Broadcast" (Driver View)
To test if a driver receives a new ride notification:
1.  **Connect as a Driver**: Use a JWT token for a user with the `DRIVER` role.
2.  **Listen for Events**: In the "Listeners" section, add a new row and type: `NEW_RIDE_BROADCAST`.
3.  **Trigger the Event**:
    *   Open a *separate* regular Postman tab (HTTP).
    *   Make a `POST` request to `http://localhost:4000/api/rides` to create a ride.
    *   **Crucial**: Use a `fromZip` that matches one of the zip codes in the Driver's profile.
4.  **Verify**: Switch back to the Socket.io tab. You should see the ride details appear under the `NEW_RIDE_BROADCAST` event automatically.

---

## 3. Testing "The interest" (Rider View)
To test if a rider sees interested drivers:
1.  **Connect as a Rider**: Use a JWT token for a user with the `USER` role.
2.  **Listen for Events**: Add a listener for `DRIVER_INTERESTED`.
3.  **Trigger the Event**:
    *   Use the API to have a Driver "Accept" a Ride Request for the rider's active ride.
4.  **Verify**: The Driver's name and rating should appear in the Rider's socket console.

---

## 4. Other Events to Listen For
You can add these listeners to see the full lifecycle:
- `RIDE_CONFIRMED`: Sent to the chosen driver.
- `RIDE_UNAVAILABLE`: Sent to all other drivers in the zip.
- `RIDE_CANCELLED`: Sent when the other party cancels.
- `RIDE_COMPLETED`: Sent to the rider when the driver finish the trip.

## 5. Troubleshooting
- **Connection Failed**: Ensure your JWT token isn't expired.
- **No Messages Received**: Ensure the Driver's `serviceZipCodes` in the database actually contains the `fromZip` of the ride being created. Socket rooms are case-sensitive and spacing-sensitive (our code trims them, but double-check).
