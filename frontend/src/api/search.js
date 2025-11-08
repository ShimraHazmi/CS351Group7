import { API_BASE_URL } from './config';

export const searchAPI = {
  searchCandidates: async (query) => {
    console.log("\n" + "=".repeat(60));
    console.log("FRONTEND -> BACKEND: Candidate Search");
    console.log("=".repeat(60));
    console.log("Step 1: Preparing request");
    console.log(`  Query: "${query}"`);
    console.log(`  URL: ${API_BASE_URL}/search/candidates/`);
    console.log(`  Method: GET`);
    
    try {
      console.log("\nStep 2: Sending request to backend...");
      const startTime = performance.now();
      
      const response = await fetch(
        `${API_BASE_URL}/search/candidates/?q=${encodeURIComponent(query)}`
      );
      
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      
      console.log("\nStep 3: Received response from backend");
      console.log(`  Status: ${response.status} ${response.statusText}`);
      console.log(`  Time taken: ${duration}ms`);
      
      const data = await response.json();
      
      console.log("\nStep 4: Parsing response data");
      console.log(`  Success: ${data.success}`);
      console.log(`  Message: ${data.message}`);
      console.log(`  Results count: ${data.results?.length || 0}`);
      console.log("\nStep 5: Full response data:");
      console.log(data);
      console.log("=".repeat(60) + "\n");
      
      return data;
    } catch (error) {
      console.error("\nERROR in request:");
      console.error(error);
      console.log("=".repeat(60) + "\n");
      throw error;
    }
  },

  searchElections: async (query) => {
    console.log("\n" + "=".repeat(60));
    console.log("FRONTEND -> BACKEND: Election Search");
    console.log("=".repeat(60));
    console.log("Step 1: Preparing request");
    console.log(`  Query: "${query}"`);
    console.log(`  URL: ${API_BASE_URL}/search/elections/`);
    
    try {
      console.log("\nStep 2: Sending request...");
      const startTime = performance.now();
      
      const response = await fetch(
        `${API_BASE_URL}/search/elections/?q=${encodeURIComponent(query)}`
      );
      
      const endTime = performance.now();
      console.log(`\nStep 3: Response received (${(endTime - startTime).toFixed(2)}ms)`);
      console.log(`  Status: ${response.status}`);
      
      const data = await response.json();
      console.log("\nStep 4: Response data:");
      console.log(data);
      console.log("=".repeat(60) + "\n");
      
      return data;
    } catch (error) {
      console.error("\nERROR:", error);
      console.log("=".repeat(60) + "\n");
      throw error;
    }
  },

  searchUsers: async (query) => {
    console.log("\n" + "=".repeat(60));
    console.log("FRONTEND -> BACKEND: User Search");
    console.log("=".repeat(60));
    console.log(`  Query: "${query}"`);
    
    try {
      const startTime = performance.now();
      const response = await fetch(
        `${API_BASE_URL}/search/users/?q=${encodeURIComponent(query)}`
      );
      const endTime = performance.now();
      
      const data = await response.json();
      console.log(`Response received in ${(endTime - startTime).toFixed(2)}ms`);
      console.log(data);
      console.log("=".repeat(60) + "\n");
      
      return data;
    } catch (error) {
      console.error("ERROR:", error);
      throw error;
    }
  }
};
