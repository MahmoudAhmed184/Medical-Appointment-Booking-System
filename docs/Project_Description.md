## 		 **Medical Project(React \+ Django)**

##  **Functional Requirements**

### **1\. User Roles and Authentication**

* **Registration & Login**

  * Patients and Doctors can register.   
* **Role-based Access Control**

  * Admin: full access to system management.

  * Doctor: manage availability and view appointments.

  * Patient: book and manage appointments.

* **Token-based authentication** (JWT via Django Rest Framework \+ `djangorestframework-simplejwt`).

---

### **2\. Admin Capabilities**

* View all users (doctors & patients).

* Approve or block doctors/patients.

* CRUD on specialties, doctors, and other system configurations.

* View all appointments.

---

### **3\. Doctor Capabilities**

* Set availability schedule (days/times).

* View upcoming and past appointments.

* Manage profile (specialty, bio, contact).

* Optionally: mark appointment as approved or rejected, and can add notes.

---

### **4\. Patient Capabilities**

* View list of available doctors (with filters: specialty, name, etc.).

* View a doctor's availability.

* Book appointment (date/time slot).

* View, cancel, or reschedule their appointments.

* Edit personal profile.

---

### **5\. Appointments Management**

* Real-time validation of availability.

* Avoid double booking.

* Appointment status: pending, confirmed, completed, cancelled.

---

### **6\. Notifications** 

* Email confirmation for bookings.

---

## **Technical Requirements**

### **1\. Frontend (React)**

* Role-based routing using React Router.

* Secure login/authentication handling (JWT).

* Form validation

* State management (Context API, Redux Toolkit).

* UI Framework: Material UI or any other UI library except bootstrap (Don’t use bootstrap)

* API integration with Django backend.

---

### **2\. Backend (Django \+ Django REST Framework)**

* Separate models for Users, Doctors, Patients, Appointments.

* Use of Django’s `AbstractUser` to customize roles.

* DRF ViewSets for REST API.

* Permissions and authentication via DRF.

* Doctor availability stored and validated for booking.

* Admin dashboard via Django admin.

---

## 

