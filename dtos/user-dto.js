class UserDto {
  username;
  email;
  isActivated;
  permissions;

  constructor(model) {
    this.username = model.username;
    this.email = model.email;
    this.isActivated = model.isActivated;
    this.permissions = model.role ? model.role.permissions : {};
  }
}

export default UserDto;
