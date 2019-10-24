import axios from 'axios';
import ServerRouter from './ServerRouter';

if (typeof window !== 'undefined') {
  window.active_ajax = 0;
  axios.interceptors.request.use(function (config) {
    window.active_ajax += 1;
    return config;
  }, function (error) {
    window.active_ajax += 1;
    return Promise.reject(error);
  });
  
  axios.interceptors.response.use(function (response) {
    window.active_ajax -= 1;
    return response;
  }, function (error) {
    window.active_ajax -= 1;
    return Promise.reject(error);
  });
}

export default class Api {
  constructor(id_token) {
    this.id_token = typeof id_token === 'undefined' ? '' : id_token;
  }

  send(options) {
    return axios({
      method: options.method,
      url: options.url,
      data: options.data,
      headers: {
        ...options.headers,
        Authorization: this.id_token
      }
    })
  }
  
  login(email, password) {
    return this.send({
      method: 'post',
      url: `${ServerRouter.frontend()}/login`,
      data: {
        email: email,
        password: password
      }
    })
  }
  
  login_wp(email, password) {
	    return this.send({
	      method: 'post',
	      url: "https://www.motivatemd.com/wp-json/jwt-auth/v1/token",
	      data: {
	    	  username: email,
	    	  password: password
	      }
	    })
	  }

  signup(firstname, lastname, email, password) {
    return this.send({
      method: 'post',
      url: `${ServerRouter.backend()}/auth/signup`,
      data: {
        user: {
          firstname: firstname,
          lastname: lastname,
          email: email,
          password: password
        }
      }
    })
  }
  
  update_player_id(id) {
      return this.send({
        method: 'post',
        url: `${ServerRouter.backend()}/auth/update_player_id`,
        data: {
          player_id: id
        }
      })
  }
  
  get_previous_event_list() {
	  return this.send({
        method: 'get',
        url: `${ServerRouter.backend()}/get_previous_event_list`
      })
  }
  
  confirm_event(id) {
      return this.send({
        method: 'put',
        url: `${ServerRouter.backend()}/confirm_event/${id}`,
        data: {
        	goal_event: ""
        }
      })
  }

  activate_account(token) {
    return this.send({
      method: 'post',
      url: `${ServerRouter.backend()}/auth/activate`,
      data: {
        token: token
      }
    })
  }

  validate_pass_reset_token(token) {
    return this.send({
      method: 'post',
      url: `${ServerRouter.backend()}/auth/validate_pass_reset_token`,
      data: {
        token: token
      }
    })
  }

  reset_password(token, password, confirm) {
    return this.send({
      method: 'post',
      url: `${ServerRouter.backend()}/auth/reset_password`,
      data: {
        token: token,
        password: password,
        confirm: confirm
      }
    })
  }

  send_reset_link(email) {
    return this.send({
      method: 'post',
      url: `${ServerRouter.backend()}/auth/send_reset_link`,
      data: {
        email: email
      }
    })
  }
  get_session() {
    return this.send({
      method: 'get',
      url: `${ServerRouter.backend()}/auth/session`
    });
  }

  get_onboarding() {
    return this.send({
      method: 'get',
      url: `${ServerRouter.backend()}/pages/onboarding`
    });
  }

  get_progress() {
    return this.send({
      method: 'get',
      url: `${ServerRouter.backend()}/pages/progress`
    });
  }

  inbox_detail(){
    return this.send({
      method: 'get',
      url: `${ServerRouter.backend()}/pages/inbox`
    });
  }

  update_education(id, new_education) {
    return this.send({
      method: 'put',
      url: `${ServerRouter.backend()}/educations/${id}`,
      data: {
        education: new_education
      }
    })
  }

  update_application(id, new_application) {
    return this.send({
      method: 'put',
      url: `${ServerRouter.backend()}/applications/${id}`,
      data: {
        application: new_application
      }
    })
  }

  update_uni_selections(uni_selections) {
    return this.send({
      method: 'put',
      url: `${ServerRouter.backend()}/uni_selections/update_all`,
      data: {
        uni_selections: uni_selections
      }
    })
  }

  update_goal_selection(id, new_goal_selection) {
    return this.send({
      method: 'put',
      url: `${ServerRouter.backend()}/goal_selections/${id}`,
      data: {
        goal_selection: new_goal_selection
      }
    })
  }

  update_mcat(id, new_mcat) {
    return this.send({
      method: 'put',
      url: `${ServerRouter.backend()}/mcats/${id}`,
      data: {
        mcat: new_mcat
      }
    })
  }

  get_notifs(expanded_at, offset) {
    return this.send({
      method: 'get',
      url: `${ServerRouter.backend()}/notifs?expanded_at=${expanded_at}&offset=${offset}`
    });
  }

  create_goal_event(goal_event) {
    return this.send({
      method: 'post',
      url: `${ServerRouter.backend()}/goal_events`,
      data: {
        goal_event: goal_event,
        timezone_name: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    })
  }

  update_goal_event(id, goal_event) {
    return this.send({
      method: 'put',
      url: `${ServerRouter.backend()}/goal_events/${id}`,
      data: {
        goal_event: goal_event,
        timezone_name: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    })
  }

  delete_goal_event(id) {
    return this.send({
      method: 'delete',
      url: `${ServerRouter.backend()}/goal_events/${id}`
    })
  }

  create_extracur(extracur) {
    return this.send({
      method: 'post',
      url: `${ServerRouter.backend()}/extracurs`,
      data: {
        extracur: extracur
      }
    })
  }

  update_extracur(id, extracur) {
    return this.send({
      method: 'put',
      url: `${ServerRouter.backend()}/extracurs/${id}`,
      data: {
        extracur: extracur
      }
    })
  }

  delete_extracur(id) {
    return this.send({
      method: 'delete',
      url: `${ServerRouter.backend()}/extracurs/${id}`
    })
  }

  create_app_step(app_step) {
    return this.send({
      method: 'post',
      url: `${ServerRouter.backend()}/app_steps`,
      data: {
        app_step: app_step
      }
    })
  }

  update_app_step(id, app_step) {
    return this.send({
      method: 'put',
      url: `${ServerRouter.backend()}/app_steps/${id}`,
      data: {
        app_step: app_step
      }
    })
  }

  delete_app_step(id) {
    return this.send({
      method: 'delete',
      url: `${ServerRouter.backend()}/app_steps/${id}`
    })
  }

  	create_timer(timer) {
  		return this.send({
  			method: 'post',
  			url: `${ServerRouter.backend()}/timers`,
  			data: {
  				timer: timer
  			}
  		})
  	}

  	get_timer_list() {
  		return this.send({
  			method: 'get',
  			url: `${ServerRouter.backend()}/get_timer_list?currentTime=${new Date()}&timezone=${new Date().getTimezoneOffset()}`
  		})
  	}
  
  	get_timer_setting() {
  		return this.send({
  			method: 'get',
  			url: `${ServerRouter.backend()}/get_timer_setting`
  		})
  	}
  
  	update_target_round(timer){
  		return this.send({
  			method: 'post',
	        url: `${ServerRouter.backend()}/update_target_round`,
	        data: {
	        	timer: timer
	        }
  		})
  	}
  	
  	update_timer_settings(timer_setting){
  		return this.send({
  			method: 'post',
  	        url: `${ServerRouter.backend()}/update_timer_settings`,
  	        data: {
  	          timer_setting: timer_setting
  	        }
  		})
  	}
  	
  	update_timer(id,timer){
        return this.send({
            method: 'put',
            url: `${ServerRouter.backend()}/timers/${id}`,
            data: {
            	timer: timer
            }
        })
    }

    create_new_note(app_note){
        return this.send({
            method: 'post',
            url: `${ServerRouter.backend()}/app_notes`,
            data: {
              app_note: app_note
            }
        })
    }

    update_note(id, app_note){
       return this.send({
           method: 'put',
           url: `${ServerRouter.backend()}/app_notes/${id}`,
           data: {
             app_note: app_note
           }
       })
    }

    delete_timer(id) {
        return this.send({
            method: 'delete',
            url: `${ServerRouter.backend()}/timers/${id}`
        })
    }

    delete_note(id){
       return this.send({
         method: 'delete',
         url: `${ServerRouter.backend()}/app_notes/${id}`
       })
    }

    get_calendar() {
      return this.send({
        method: 'get',
        url: `${ServerRouter.backend()}/pages/calendar`
      });
    }
    
    get_email_list() {
        return this.send({
        	method: 'get',
        	url: `https://s3-us-west-2.amazonaws.com/s.cdpn.io/311743/dummy-emails.json`
        });
    }

    create_message(message){
        return this.send({
            method: 'post',
            url: `${ServerRouter.backend()}/messages`,
            data: {
              message: message
            }
        })
    }
    
    update_message(id,message){
        return this.send({
            method: 'put',
            url: `${ServerRouter.backend()}/messages/${id}`,
            data: {
              message: message
            }
        })
    }
    
    send_message(message){
        return this.send({
            method: 'post',
            url: `${ServerRouter.backend()}/send_message/`,
            data: {
              message: message
            }
        })
    }
    
    get_message_list(folder_id) {
        return this.send({
        	method: 'get',
        	url: `${ServerRouter.backend()}/get_message_list?message_folder_id=${folder_id}`
        });
    }
    
    message_read_by_user(id){
    	return this.send({
    		method: 'post',
            url: `${ServerRouter.backend()}/message_read_by_user/`,
            data: {
            	id: id
            }
    	});
    }

    trash_message(id){
        return this.send({
            method: 'post',
            url: `${ServerRouter.backend()}/trash_message/`,
            data: {
              id: id
            }
        })
    }

    message_starred_by_user(id){
        return this.send({
            method: 'post',
            url: `${ServerRouter.backend()}/message_starred_by_user/`,
            data: {
                id: id
            }
        });
    }

    message_unstarred_by_user(id){
        return this.send({
            method: 'post',
            url: `${ServerRouter.backend()}/message_unstarred_by_user/`,
            data: {
                id: id
            }
        });
    }

    search_message(search_text, currentFolder){
        return this.send({
            method: 'get',
            url: `${ServerRouter.backend()}/search_message?search_text=${search_text}&currentFolder=${currentFolder}`
        });
    }

    get_message_attachment(id){
        return this.send({
            method: 'get',
            url: `${ServerRouter.backend()}/get_message_attachment?id=${id}`
        });
    }
    
    add_and_remove_tag_to_message(message_id,message_tag_ids){
        return this.send({
            method: 'post',
            url: `${ServerRouter.backend()}/add_and_remove_tag_to_message`,
            data: {
            	message_id: message_id,
            	message_tag_ids: message_tag_ids
            }
        });
    }
    
    get_tag_message(id){
        return this.send({
            method: 'get',
            url: `${ServerRouter.backend()}/get_tag_message?message_tag_id=${id}`
        });
    }

}


