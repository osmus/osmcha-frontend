// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';

import { Button } from '../components/button';
import { Navbar } from '../components/navbar';
import { Dropdown } from '../components/dropdown';

import { isMobile } from '../utils';
import { getAuthUrl } from '../network/auth';

import {
  getOAuthToken,
  getFinalToken,
  logUserOut
} from '../store/auth_actions';

import type { RootStateType } from '../store';

class NavbarSidebar extends React.PureComponent {
  props: {
    location: Object,
    uid: ?string,
    username: ?string,
    token: ?string,
    oAuthToken: ?string,
    getOAuthToken: () => mixed,
    getFinalToken: string => mixed,
    logUserOut: () => mixed,
    push: any => any
  };

  handleLoginClick = () => {
    getAuthUrl().then(res => {
      const authUrl = new URL(res.auth_url);
      if (process.env.REACT_APP_STACK === 'DEV') {
        authUrl.searchParams.set(
          'redirect_uri',
          'http://127.0.0.1:3000/authorized'
        );
      }
      window.location.assign(authUrl.href);
    });
  };

  onUserMenuSelect = (arr: Array<Object>) => {
    const username = this.props.username;
    const uid = this.props.uid;

    if (arr.length === 1) {
      if (arr[0].url === '/logout') {
        this.props.logUserOut();
        return;
      }
      if (arr[0].url === '/my-changesets') {
        this.props.push({
          ...this.props.location,
          search: `filters={"uids":[{"label":"${uid}","value":"${uid}"}],"date__gte":[{"label":"","value":""}]}`,
          pathname: '/'
        });
        return;
      }
      if (arr[0].url === '/my-reviews') {
        this.props.push({
          ...this.props.location,
          search: `filters={"checked_by":[{"label":"${username}","value":"${username}"}],"date__gte":[{"label":"","value":""}]}`,
          pathname: '/'
        });
        return;
      }
      this.props.push({
        ...this.props.location,
        search: this.props.location.search,
        pathname: arr[0].url
      });
    } else if (arr.length > 1) {
      throw new Error('filter select array is big');
    }
  };

  renderUserMenuOptions() {
    const username = this.props.username;

    return (
      <Dropdown
        display={
          username ? (
            <span className="wmax180 align-middle inline-block txt-truncate">
              {username}
            </span>
          ) : (
            'User'
          )
        }
        options={[
          { label: 'Account settings', url: '/user' },
          {
            label: 'My Changesets',
            url: '/my-changesets'
          },
          {
            label: 'My Reviews',
            url: '/my-reviews'
          },
          { label: 'My Saved Filters', url: '/saved-filters' },
          { label: 'My Teams', url: '/teams' },
          { label: 'My Trusted Users List', url: '/trusted-users' },
          { label: 'My Watchlist', url: '/watchlist' },
          { label: 'Logout', url: '/logout' }
        ]}
        onChange={this.onUserMenuSelect}
        value={[]}
        onAdd={() => {}}
        onRemove={() => {}}
        position="right"
      />
    );
  }

  render() {
    const mobile = isMobile();

    return (
      <>
        <Navbar
          className="navbar-logo bg-gray-faint border-b border--gray-light border--1"
          title={
            <Link
              to={{
                search: window.location.search,
                pathname: '/'
              }}
              style={mobile ? { fontSize: '1.4em' } : { fontSize: '1.7em' }}
              className="color-gray"
            >
              <strong className="color-blue">OSM</strong>
              Cha
            </Link>
          }
          buttons={
            <div className="flex-parent flex-parent--row">
              <Link
                className="pr3 pointer"
                to={{
                  search: window.location.search,
                  pathname: '/about'
                }}
              >
                <svg className="icon icon--m inline-block align-middle color-darken25 color-darken50-on-hover transition">
                  <use xlinkHref="#icon-question" />
                </svg>
              </Link>
              {this.props.token ? (
                <div className="pointer">{this.renderUserMenuOptions()}</div>
              ) : (
                <Button
                  onClick={this.handleLoginClick}
                  disable={!this.props.oAuthToken}
                  iconName="osm"
                >
                  Sign in
                </Button>
              )}
            </div>
          }
        />
      </>
    );
  }
}

NavbarSidebar = connect(
  (state: RootStateType, props) => ({
    location: state.routing.location,
    oAuthToken: state.auth.get('oAuthToken'),
    token: state.auth.get('token'),
    username: state.auth.getIn(['userDetails', 'username']),
    uid: state.auth.getIn(['userDetails', 'uid'])
  }),
  {
    getOAuthToken,
    getFinalToken,
    logUserOut,
    push
  }
)(NavbarSidebar);

export { NavbarSidebar };
