#!/bin/bash

# source this file to add functions to the dotpi environment

dotpi_led_update() (
  if [[ "$USER" != "root" ]]; then
    dotpi echo_error "This command must be run as root"
    return 1
  fi

  _dotpi_command="$(basename -- "${FUNCNAME[0]:-"$0"}")"
  log_file="${DOTPI_ROOT}/var/log/${_dotpi_command}_$(date +"%Y%m%d-%H%M%S").log"
  exec &> >(dotpi log "$log_file")

  dotpi echo_info "Log of dotpi-led update: ${log_file}"

  destination="${DOTPI_ROOT}/share/dotpi-led"
  mkdir -p -- "$destination" || {
    dotpi echo_error "dotpi-led: could not create directory: ${destination}"
    return 1
  }
  cd -- "$destination" || {
    dotpi echo_error "dotpi-led: could not change to directory: ${destination}"
    return 1
  }

  service_name='dotpi-led.service'

  dotpi service_uninstall "$service_name"

  runtime_relative_path='runtime'
  destination_runtime="${destination}/${runtime_relative_path}"

  rm -rf -- "$destination_runtime"
  git clone --depth=1 https://github.com/ircam-ismm/dotpi-led.git "$destination_runtime" || {
    dotpi echo_error "dotpi-led: could not clone repositoryin in ${destination}"
    return 1
  }
  (
    cd -- "$destination_runtime" || {
      dotpi echo_error "could not change directory to runtime: ${destination_runtime}"
      exit 1
    }
    npm install --omit dev --loglevel verbose
  )

  files_to_link=()

  for f in "$runtime_relative_path"/dotpi/* ; do
    files_to_link+=( "$f" )
  done

  for f in "$runtime_relative_path"/ledstrip-config*.json; do
    files_to_link+=( "$f" )
  done

  for f in "${files_to_link[@]}"; do
    # do not overwrite existing files
    [[ -e "$(basename "$f")" ]] && continue
    ln -s -f -- "${f}" "$destination" || {
      dotpi echo_error "dotpi-led: could not create symlink for ${f} in ${destination}"
      return 1
    }
  done

  if [[ -n "$dotpi_led_strip_configuration" ]] ; then
    ledstrip_config_file="ledstrip-config-${dotpi_led_strip_configuration}.json"
    if [[ ! -e "$ledstrip_config_file" ]]; then
      dotpi echo_error "dotpi-led: no configuration file ${ledstrip_config_file} in ${destination}"
    else
      dotpi echo_info "dotpi-led: using configuration file ${ledstrip_config_file}"
      ln -s -f -- "ledstrip-config-${dotpi_led_strip_configuration}.json" "ledstrip-config-default.json"
    fi
  fi

  dotpi service_install "${DOTPI_ROOT}/share/dotpi-led/dotpi-led.service"
)
