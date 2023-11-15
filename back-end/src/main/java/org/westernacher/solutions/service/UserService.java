package org.westernacher.solutions.service;

import org.westernacher.solutions.domain.models.binding.UserEditBindingModel;
import org.westernacher.solutions.domain.models.service.UserServiceModel;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.Set;

public interface UserService extends UserDetailsService {

    boolean createUser(UserServiceModel userServiceModel);
    boolean editUser(UserEditBindingModel userEditBindingModel);
    boolean deleteUser(String username);
    Set<UserServiceModel> getAll();
    boolean promoteUser(String id);
    boolean demoteUser(String id);
    String getUserAuthority(String userId);
}
