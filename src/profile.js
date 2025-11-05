import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig.js";

// -------------------------------------------------------------
// Function to populate user info in the profile form
// Fetches user data from Firestore and fills in the form fields
// Assumes user is already authenticated
// and their UID corresponds to a document in the "users" collection
// of Firestore.
// Fields populated: name, school, city
// Form field IDs: nameInput, schoolInput, cityInput
// -------------------------------------------------------------
function populateUserInfo() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // reference to the user document
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          const { name = "", school = "", city = "" } = userData;

          document.getElementById("nameInput").value = name;
          document.getElementById("schoolInput").value = school;
          document.getElementById("cityInput").value = city;
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error getting user document:", error);
      }
    } else {
      console.log("No user is signed in");
    }
  });
}

// -------------------------------------------------------------
// Function to enable editing of user info form fields
// -------------------------------------------------------------
function editUserInfo() {
  // Enable the form fields
  const personalInfoFields = document.getElementById("personalInfoFields");
  if (personalInfoFields) {
    personalInfoFields.disabled = false;
  } else {
    // If personalInfoFields is a container, enable individual inputs
    document.getElementById("nameInput").disabled = false;
    document.getElementById("schoolInput").disabled = false;
    document.getElementById("cityInput").disabled = false;
  }

  // Optional: Focus on the first field for better UX
  document.getElementById("nameInput").focus();
}

// -------------------------------------------------------------
// Function to save updated user info from the profile form
// -------------------------------------------------------------
async function saveUserInfo() {
  const user = auth.currentUser; // ✅ get the currently logged-in user
  if (!user) {
    alert("No user is signed in. Please log in first.");
    return;
  }

  // a) get user entered values
  const userName = document.getElementById("nameInput").value;
  const userSchool = document.getElementById("schoolInput").value;
  const userCity = document.getElementById("cityInput").value;

  // Validate inputs (optional but recommended)
  if (!userName.trim()) {
    alert("Please enter your name");
    return;
  }

  try {
    // b) update user's document in Firestore
    await updateUserDocument(user.uid, userName, userSchool, userCity);

    // c) disable edit
    disableFormEditing();

    // Show success message
    alert("Profile updated successfully!");
  } catch (error) {
    console.error("Error saving user info:", error);
    alert("Error saving profile. Please try again.");
  }
}

// -------------------------------------------------------------
// Updates the user document in Firestore with new values
// Parameters:
//   uid (string)  – user's UID
//   name, school, city (strings)
// -------------------------------------------------------------
async function updateUserDocument(uid, name, school, city) {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { name, school, city });
    console.log("User document successfully updated!");
  } catch (error) {
    console.error("Error updating user document:", error);
    throw error; // Re-throw to handle in calling function
  }
}

// -------------------------------------------------------------
// Helper function to disable form editing
// -------------------------------------------------------------
function disableFormEditing() {
  const personalInfoFields = document.getElementById("personalInfoFields");
  if (personalInfoFields) {
    personalInfoFields.disabled = true;
  } else {
    // If personalInfoFields is a container, disable individual inputs
    document.getElementById("nameInput").disabled = true;
    document.getElementById("schoolInput").disabled = true;
    document.getElementById("cityInput").disabled = true;
  }
}

// -------------------------------------------------------------
// Initialize the application
// -------------------------------------------------------------
function init() {
  // Set up event listeners only after DOM is loaded
  document.addEventListener("DOMContentLoaded", function () {
    const editButton = document.querySelector("#editButton");
    const saveButton = document.querySelector("#saveButton");

    if (editButton) {
      editButton.addEventListener("click", editUserInfo);
    } else {
      console.error("Edit button not found");
    }

    if (saveButton) {
      saveButton.addEventListener("click", saveUserInfo);
    } else {
      console.error("Save button not found");
    }

    // Initialize form as disabled
    disableFormEditing();

    // Populate user info
    populateUserInfo();
  });
}

// Start the application
init();
