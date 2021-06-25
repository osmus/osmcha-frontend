import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { Button } from '../button';

const NewTeam = props => {
  const [teamName, setTeamName] = useState('');
  const [teamUsers, setTeamUsers] = useState([{}]);
  const [editing, setEditing] = useState(props.editing || false);
  const [validationErrorMessage, setValidationErrorMessage] = useState('');

  const isValid = property => property !== undefined;

  useEffect(() => {
    if (props.activeTeam) {
      setTeamName(props.activeTeam.get('name'));
      let users = [];
      props.activeTeam.get('users').map(user =>
        users.push({
          username: user.get('username'),
          uid: user.get('uid'),
          joined: user.get('joined'),
          left: user.get('left')
        })
      );
      let cleanedUsers = [];
      users.map((user, k) => {
        let u = Object.fromEntries(
          Object.entries(user).filter(([_, v]) => v !== undefined)
        );
        cleanedUsers.push(u);
      });
      setTeamUsers([...cleanedUsers]);
    }
  }, [props.activeTeam]);

  const onClickRemoveUser = idx => {
    let teamUsersToUpdate = [...teamUsers];
    teamUsersToUpdate.splice(idx, 1);
    setTeamUsers(teamUsersToUpdate);
  };

  const onClickAddOneMoreUser = () => setTeamUsers([...teamUsers, {}]);

  const onChangeInput = (property, value, idx) => {
    let teamUsersToUpdate = [...teamUsers];
    teamUsersToUpdate[idx] = { ...teamUsersToUpdate[idx], [property]: value };
    setTeamUsers(teamUsersToUpdate);
  };

  const validateData = () => {
    if (!teamName) {
      return { valid: false, error: 'Team name cannot be empty.' };
    }
    if (teamUsers) {
      try {
        if (
          teamUsers.filter(i => i.hasOwnProperty('username')).length ===
          teamUsers.length
        ) {
          return { valid: true };
        } else {
          return {
            valid: false,
            error:
              'Each object inside the array needs to have a username property.'
          };
        }
      } catch (err) {
        return {
          valid: false,
          error:
            'Verify if you pasted a correctly formated JSON array in the users field.'
        };
      }
    } else {
      return { valid: false, error: 'Users cannot be empty' };
    }
  };

  const onSave = e => {
    const validation = validateData();

    if (validation.valid) {
      if (props.activeTeam) {
        props.onChange(props.activeTeam.get('id'), teamName, teamUsers);
        setValidationErrorMessage('');
      } else {
        props.onCreate(teamName, teamUsers);
        setEditing(false);
        setValidationErrorMessage('');
      }
    } else {
      setValidationErrorMessage(validation.error);
    }
  };

  return (
    <>
      {editing ? (
        <>
          {props.activeTeam ? (
            <></>
          ) : (
            <h3 className="txt-h4 txt-bold">Add a new mapping team</h3>
          )}
          <>
            <strong className="txt-truncate pt6">Name</strong>
            <input
              placeholder="New team name"
              className="input wmax180"
              // ref={(r) => {
              //   if (this.clicked) {
              //     r && r.select();
              //     this.clicked = false;
              //   }
              // }}
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              // onKeyDown={this.onKeyDown}
              disabled={!props.userIsOwner}
            />
            <strong className="txt-truncate pt6">Users</strong>
            {teamUsers.map((user, k) => (
              <form key={k} className="grid mb3">
                <label className="col w-1/5">
                  Username
                  <input
                    className="input"
                    type="text"
                    required
                    id="username"
                    placeholder="Username"
                    value={user.username || ''}
                    onChange={e =>
                      onChangeInput(e.target.id, e.target.value, k)
                    }
                    disabled={!props.userIsOwner}
                  />
                </label>
                <label className="col w-1/5">
                  UID
                  <input
                    className="input"
                    type="text"
                    id="uid"
                    placeholder="User UID"
                    value={user.uid || ''}
                    onChange={e =>
                      onChangeInput(e.target.id, e.target.value, k)
                    }
                    disabled={!props.userIsOwner}
                  />
                </label>
                <label className="col w-1/5">
                  Joined the team
                  <input
                    className="input"
                    type="date"
                    placeholder="Joined the team"
                    id="joined"
                    value={user.joined || ''}
                    onChange={e =>
                      onChangeInput(e.target.id, e.target.value, k)
                    }
                    disabled={!props.userIsOwner}
                  />
                </label>
                <label className="col w-1/5">
                  Left the team
                  <input
                    className="input"
                    type="date"
                    id="left"
                    value={user.left || ''}
                    onChange={e =>
                      onChangeInput(e.target.id, e.target.value, k)
                    }
                    disabled={!props.userIsOwner}
                  />
                </label>
                <label>
                  <br></br>
                  <Button
                    onClick={e => {
                      e.preventDefault();
                      onClickRemoveUser(k);
                    }}
                    className="input col w-1/5"
                  >
                    <svg className="icon w24 h24">
                      <use xlinkHref="#icon-trash" />
                    </svg>
                  </Button>
                </label>
              </form>
            ))}
            <Button onClick={onClickAddOneMoreUser}>Add one more user</Button>

            <span className="txt-light txt-truncate pt6">
              Check the{' '}
              <a
                className="link"
                href="https://github.com/mapbox/osmcha-frontend/wiki/Mapping-Teams"
                target="_blank"
                rel="noopener noreferrer"
              >
                reference
              </a>{' '}
              about the users field JSON format.
            </span>

            <p className="txt-light txt-truncate pt6">
              The mapping team members are <strong>public</strong> and can be
              visualized by any logged in OSMCha user.
            </p>

            {validationErrorMessage && (
              <span className="flex-parent flex-parent--row mt12 color-red-dark txt-bold">
                {validationErrorMessage}
              </span>
            )}

            <span className="flex-parent flex-parent--row mt12">
              {props.userIsOwner && (
                <Button className="input wmax120 ml6" onClick={onSave}>
                  Save
                </Button>
              )}
              {props.activeTeam ? (
                <Link
                  to={{ pathname: '/teams' }}
                  className="mx3 btn btn--s border border--1 border--darken5 border--darken25-on-hover round bg-darken10 bg-darken5-on-hover color-gray transition input wmax120 ml6"
                >
                  Back to teams
                </Link>
              ) : (
                <Button
                  className="input wmax120 ml6"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              )}
            </span>
          </>
        </>
      ) : (
        <>
          <Button
            className="input wmax120 ml12"
            onClick={() => setEditing(true)}
          >
            Add+
          </Button>
        </>
      )}
    </>
  );
};

NewTeam.propTypes = {
  teamUsers: PropTypes.arrayOf(PropTypes.object),
  onClickRemoveUser: PropTypes.func,
  onClickAddOneMoreUser: PropTypes.func,
  onChangeInput: PropTypes.func
};

export default NewTeam;
