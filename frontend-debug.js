/**
 * Frontend Debug Script for HR Jobs Loading Issue
 * Add this to your browser console when the HR dashboard loads
 */

console.log('🔧 DEBUGGING HR JOBS FRONTEND ISSUE');

// Monitor HR Service API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0].includes('/hr/jobs')) {
    console.log('🌐 HR Jobs API Call:', args[0]);
    return originalFetch.apply(this, args)
      .then(response => {
        console.log('📡 HR Jobs API Response Status:', response.status);
        return response.clone().json().then(data => {
          console.log('📊 HR Jobs API Response Data:', data);
          console.log('📋 Response Structure:');
          console.log('- Type:', typeof data);
          console.log('- Keys:', Object.keys(data));
          if (data.jobs) {
            console.log('- Jobs Count:', data.jobs.length);
            if (data.jobs.length > 0) {
              console.log('- First Job Sample:', data.jobs[0]);
              console.log('- First Job Keys:', Object.keys(data.jobs[0]));
            }
          }
          return Promise.resolve(response);
        }).catch(err => {
          console.error('❌ Failed to parse response as JSON:', err);
          return Promise.resolve(response);
        });
      })
      .catch(error => {
        console.error('❌ HR Jobs API Error:', error);
        throw error;
      });
  }
  return originalFetch.apply(this, args);
};

// Monitor Angular HTTP calls
if (window.ng) {
  console.log('🅰️ Angular DevTools detected');
  
  // Monitor component lifecycle
  const checkMyJobsComponent = () => {
    const components = ng.getComponent(document.querySelector('app-my-jobs'));
    if (components) {
      console.log('📱 MyJobs Component State:', {
        isLoading: components.isLoading,
        jobListingsCount: components.jobListings?.length,
        filteredJobsCount: components.filteredJobs?.length,
        totalJobs: components.totalJobs
      });
      
      if (components.jobListings?.length > 0) {
        console.log('✅ Jobs loaded successfully:', components.jobListings[0]);
      } else {
        console.log('❌ No jobs loaded');
      }
    }
  };
  
  // Check every 2 seconds
  const intervalId = setInterval(checkMyJobsComponent, 2000);
  
  // Stop after 30 seconds
  setTimeout(() => {
    clearInterval(intervalId);
    console.log('🛑 Stopped monitoring component state');
  }, 30000);
}

// Monitor console errors
const originalError = console.error;
console.error = function(...args) {
  if (args.some(arg => typeof arg === 'string' && (arg.includes('job') || arg.includes('hr')))) {
    console.log('🚨 Job-related error detected:', args);
  }
  return originalError.apply(this, args);
};

console.log('✅ Debug monitoring activated. Navigate to My Job Postings page now.');
console.log('📍 Expected behavior: API call → Data transformation → UI update');
console.log('🔍 Watch for API calls, response data, and component state changes above.');
