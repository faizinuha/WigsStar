// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const client_id = "6eacc2472f984eaa8033bb187b012d78";
  const client_secret = env.SPOTIFY_CLIENT_SECRET;
  return {
    server: {
      host: "::",
      port: 8080
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      // Custom plugin to proxy Spotify API calls during development
      mode === "development" && {
        name: "spotify-dev-api-proxy",
        configureServer(server) {
          server.middlewares.use("/api/spotify", async (req, res, next) => {
            console.log("Middleware for /api/spotify triggered.");
            console.log("Loaded SPOTIFY_CLIENT_SECRET:", client_secret ? "found" : "NOT FOUND");
            try {
              if (!client_secret) {
                throw new Error("SPOTIFY_CLIENT_SECRET not found in .env file.");
              }
              const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  "Authorization": "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64")
                },
                body: "grant_type=client_credentials"
              });
              const tokenData = await tokenResponse.json();
              if (!tokenResponse.ok) {
                console.error("Error fetching Spotify token:", tokenData);
                throw new Error("Failed to fetch access token from Spotify.");
              }
              const accessToken = tokenData.access_token;
              const recommendationsUrl = "https://api.spotify.com/v1/recommendations?seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_genres=classical%2Ccountry&seed_tracks=0c6xIDDpzE81m2q797ordA";
              const recommendationsResponse = await fetch(recommendationsUrl, {
                headers: { Authorization: `Bearer ${accessToken}` }
              });
              const recommendationsData = await recommendationsResponse.json();
              if (!recommendationsResponse.ok) {
                console.error("Error fetching Spotify recommendations:", recommendationsData);
                throw new Error("Failed to fetch recommendations from Spotify.");
              }
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(recommendationsData));
            } catch (error) {
              console.error("Spotify proxy middleware error:", error);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: error.message }));
            }
          });
        }
      }
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG5cbiAgY29uc3QgY2xpZW50X2lkID0gJzZlYWNjMjQ3MmY5ODRlYWE4MDMzYmIxODdiMDEyZDc4JztcbiAgY29uc3QgY2xpZW50X3NlY3JldCA9IGVudi5TUE9USUZZX0NMSUVOVF9TRUNSRVQ7XG5cbiAgcmV0dXJuIHtcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGhvc3Q6IFwiOjpcIixcbiAgICAgIHBvcnQ6IDgwODAsXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbXG4gICAgICByZWFjdCgpLFxuICAgICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJiBjb21wb25lbnRUYWdnZXIoKSxcbiAgICAgIC8vIEN1c3RvbSBwbHVnaW4gdG8gcHJveHkgU3BvdGlmeSBBUEkgY2FsbHMgZHVyaW5nIGRldmVsb3BtZW50XG4gICAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmIHtcbiAgICAgICAgbmFtZTogJ3Nwb3RpZnktZGV2LWFwaS1wcm94eScsXG4gICAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IGFueSkge1xuICAgICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvc3BvdGlmeScsIGFzeW5jIChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJNaWRkbGV3YXJlIGZvciAvYXBpL3Nwb3RpZnkgdHJpZ2dlcmVkLlwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTG9hZGVkIFNQT1RJRllfQ0xJRU5UX1NFQ1JFVDpcIiwgY2xpZW50X3NlY3JldCA/IFwiZm91bmRcIiA6IFwiTk9UIEZPVU5EXCIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgaWYgKCFjbGllbnRfc2VjcmV0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTUE9USUZZX0NMSUVOVF9TRUNSRVQgbm90IGZvdW5kIGluIC5lbnYgZmlsZS4nKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIDEuIEdldCBBY2Nlc3MgVG9rZW4gZnJvbSBTcG90aWZ5XG4gICAgICAgICAgICAgIGNvbnN0IHRva2VuUmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hY2NvdW50cy5zcG90aWZ5LmNvbS9hcGkvdG9rZW4nLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiAnQmFzaWMgJyArIEJ1ZmZlci5mcm9tKGNsaWVudF9pZCArICc6JyArIGNsaWVudF9zZWNyZXQpLnRvU3RyaW5nKCdiYXNlNjQnKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYm9keTogJ2dyYW50X3R5cGU9Y2xpZW50X2NyZWRlbnRpYWxzJ1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICBjb25zdCB0b2tlbkRhdGEgPSBhd2FpdCB0b2tlblJlc3BvbnNlLmpzb24oKSBhcyBhbnk7XG4gICAgICAgICAgICAgIGlmICghdG9rZW5SZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBmZXRjaGluZyBTcG90aWZ5IHRva2VuOlwiLCB0b2tlbkRhdGEpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGZldGNoIGFjY2VzcyB0b2tlbiBmcm9tIFNwb3RpZnkuJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgYWNjZXNzVG9rZW4gPSB0b2tlbkRhdGEuYWNjZXNzX3Rva2VuO1xuXG4gICAgICAgICAgICAgIC8vIDIuIEdldCBSZWNvbW1lbmRhdGlvbnMgZnJvbSBTcG90aWZ5XG4gICAgICAgICAgICAgIGNvbnN0IHJlY29tbWVuZGF0aW9uc1VybCA9ICdodHRwczovL2FwaS5zcG90aWZ5LmNvbS92MS9yZWNvbW1lbmRhdGlvbnM/c2VlZF9hcnRpc3RzPTROSFFVR3podFRMRnZnRjVTWmVzTEsmc2VlZF9nZW5yZXM9Y2xhc3NpY2FsJTJDY291bnRyeSZzZWVkX3RyYWNrcz0wYzZ4SUREcHpFODFtMnE3OTdvcmRBJztcbiAgICAgICAgICAgICAgY29uc3QgcmVjb21tZW5kYXRpb25zUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChyZWNvbW1lbmRhdGlvbnNVcmwsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7IEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthY2Nlc3NUb2tlbn1gIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBjb25zdCByZWNvbW1lbmRhdGlvbnNEYXRhID0gYXdhaXQgcmVjb21tZW5kYXRpb25zUmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICBpZiAoIXJlY29tbWVuZGF0aW9uc1Jlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGZldGNoaW5nIFNwb3RpZnkgcmVjb21tZW5kYXRpb25zOlwiLCByZWNvbW1lbmRhdGlvbnNEYXRhKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBmZXRjaCByZWNvbW1lbmRhdGlvbnMgZnJvbSBTcG90aWZ5LicpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gMy4gU2VuZCBzdWNjZXNzZnVsIHJlc3BvbnNlIGJhY2sgdG8gdGhlIGNsaWVudFxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeShyZWNvbW1lbmRhdGlvbnNEYXRhKSk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignU3BvdGlmeSBwcm94eSBtaWRkbGV3YXJlIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdLmZpbHRlcihCb29sZWFuKSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsY0FBYyxlQUFlO0FBQy9QLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBRTNDLFFBQU0sWUFBWTtBQUNsQixRQUFNLGdCQUFnQixJQUFJO0FBRTFCLFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixTQUFTLGlCQUFpQixnQkFBZ0I7QUFBQTtBQUFBLE1BRTFDLFNBQVMsaUJBQWlCO0FBQUEsUUFDeEIsTUFBTTtBQUFBLFFBQ04sZ0JBQWdCLFFBQWE7QUFDM0IsaUJBQU8sWUFBWSxJQUFJLGdCQUFnQixPQUFPLEtBQVUsS0FBVSxTQUFjO0FBQzlFLG9CQUFRLElBQUksd0NBQXdDO0FBQ3BELG9CQUFRLElBQUksaUNBQWlDLGdCQUFnQixVQUFVLFdBQVc7QUFDbEYsZ0JBQUk7QUFDRixrQkFBSSxDQUFDLGVBQWU7QUFDbEIsc0JBQU0sSUFBSSxNQUFNLCtDQUErQztBQUFBLGNBQ2pFO0FBR0Esb0JBQU0sZ0JBQWdCLE1BQU0sTUFBTSwwQ0FBMEM7QUFBQSxnQkFDMUUsUUFBUTtBQUFBLGdCQUNSLFNBQVM7QUFBQSxrQkFDUCxnQkFBZ0I7QUFBQSxrQkFDaEIsaUJBQWlCLFdBQVcsT0FBTyxLQUFLLFlBQVksTUFBTSxhQUFhLEVBQUUsU0FBUyxRQUFRO0FBQUEsZ0JBQzVGO0FBQUEsZ0JBQ0EsTUFBTTtBQUFBLGNBQ1IsQ0FBQztBQUVELG9CQUFNLFlBQVksTUFBTSxjQUFjLEtBQUs7QUFDM0Msa0JBQUksQ0FBQyxjQUFjLElBQUk7QUFDckIsd0JBQVEsTUFBTSxpQ0FBaUMsU0FBUztBQUN4RCxzQkFBTSxJQUFJLE1BQU0sNENBQTRDO0FBQUEsY0FDOUQ7QUFDQSxvQkFBTSxjQUFjLFVBQVU7QUFHOUIsb0JBQU0scUJBQXFCO0FBQzNCLG9CQUFNLDBCQUEwQixNQUFNLE1BQU0sb0JBQW9CO0FBQUEsZ0JBQzlELFNBQVMsRUFBRSxlQUFlLFVBQVUsV0FBVyxHQUFHO0FBQUEsY0FDcEQsQ0FBQztBQUVELG9CQUFNLHNCQUFzQixNQUFNLHdCQUF3QixLQUFLO0FBQy9ELGtCQUFJLENBQUMsd0JBQXdCLElBQUk7QUFDL0Isd0JBQVEsTUFBTSwyQ0FBMkMsbUJBQW1CO0FBQzVFLHNCQUFNLElBQUksTUFBTSwrQ0FBK0M7QUFBQSxjQUNqRTtBQUdBLGtCQUFJLGFBQWE7QUFDakIsa0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELGtCQUFJLElBQUksS0FBSyxVQUFVLG1CQUFtQixDQUFDO0FBQUEsWUFFN0MsU0FBUyxPQUFZO0FBQ25CLHNCQUFRLE1BQU0sbUNBQW1DLEtBQUs7QUFDdEQsa0JBQUksYUFBYTtBQUNqQixrQkFBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsa0JBQUksSUFBSSxLQUFLLFVBQVUsRUFBRSxPQUFPLE1BQU0sUUFBUSxDQUFDLENBQUM7QUFBQSxZQUNsRDtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsSUFDRixFQUFFLE9BQU8sT0FBTztBQUFBLElBQ2hCLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
