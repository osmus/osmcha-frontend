import React from 'react';
import { connect } from 'react-redux';

import { createPopup } from '../../utils/create_popup';
import { handlePopupCallback } from '../../utils/handle_popup_callback';
import { osmAuthUrl } from '../../config/constants';
import { isDev, isLocal } from '../../config';
import type { RootStateType } from '../../store';
import { getFinalToken } from '../../store/auth_actions';
import { getChangesetsPage } from '../../store/changesets_page_actions';
import { getChangeset } from '../../store/changeset_actions';

class SignInButton extends React.PureComponent {
  props: {
    text: string,
    oAuthToken: ?string,
    changesetId: number,
    pageIndex: number,
    getFinalToken: string => mixed,
    getChangeset: string => mixed,
    getChangesetsPage: string => mixed
  };

  handleLoginClick = () => {
    var oAuthToken = this.props.oAuthToken;
    if (!oAuthToken) return;
    let url = `${osmAuthUrl}?oauth_token=${oAuthToken}`;
    if (isDev || isLocal) {
      url = '/local-landing.html';
    }

    if (oAuthToken) {
      createPopup('oauth_popup', url);
      handlePopupCallback().then(oAuthObj => {
        this.props.getFinalToken(oAuthObj.oauth_verifier);
      });
    }
  };
  render() {
    return (
      <button
        onClick={this.handleLoginClick}
        className="btn btn--s border border--1 border--darken5 border--darken25-on-hover round bg-darken10 bg-darken5-on-hover color-gray transition"
      >
        <svg className="icon w18 h18 inline-block align-middle pr3">
          <use xlinkHref="#icon-osm" />
        </svg>
        {this.props.text}
      </button>
    );
  }
}

SignInButton = connect(
  (state: RootStateType, props) => ({
    oAuthToken: state.auth.get('oAuthToken'),
    pageIndex: state.changesetsPage.get('pageIndex') || 0
  }),
  {
    getFinalToken,
    getChangeset,
    getChangesetsPage
  }
)(SignInButton);

export { SignInButton };
