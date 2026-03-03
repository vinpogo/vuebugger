# State Management

There is no specific solution for state management. Depending on the usecase an appropriate system shall be implemented.

When a package wide state is needed, encapsulate it into a module. If the state needs to be reusable, encapsulate it into a function. Any other state management solution have to be verified with the user.

The most important aspect is to avoid memory leaks and to keep it as minimal as possible.

