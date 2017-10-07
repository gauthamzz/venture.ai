import React, { Component } from 'react'
import PropTypes from 'prop-types'
import autobind from 'autobind-decorator'
import moment from 'moment'
import Decimal from 'decimal.js'
import 'moment-duration-format'
import { reduxForm, Field } from 'redux-form'
import cn from 'classnames'
import Countdown from 'components/Countdown'
import CurrencyName from 'components/CurrencyName'
import { decimalToText } from 'components/DecimalValue'

import Outcome from 'components/Outcome'

import FormRadioButton from 'components/FormRadioButton'
import FormInput from 'components/FormInput'
import FormSelect from 'components/FormSelect'
import FormCheckbox from 'components/FormCheckbox'

import { RESOLUTION_TIME } from 'utils/constants'
import { marketShape } from 'utils/shapes'

import './marketList.less'

const resolutionFilters = [
  {
    label: 'All',
    value: '',
  },
  {
    label: 'Resolved',
    value: 'RESOLVED',
  },
  {
    label: 'Unresolved',
    value: 'UNRESOLVED',
  },
]

const selectFilter = [
  { value: '---', label: '---' },
  { value: 'RESOLUTION_DATE_ASC', label: 'RESOLUTION_DATE_ASC' },
  { value: 'RESOLUTION_DATE_DESC', label: 'RESOLUTION_DATE_DESC' },
  { value: 'TRADING_VOLUME_ASC', label: 'TRADING_VOLUME_ASC' },
  { value: 'TRADING_VOLUME_DESC', label: 'TRADING_VOLUME_DESC' },
]

class MarketList extends Component {
  componentWillMount() {
    this.props.fetchMarkets()
  }

  @autobind
  handleViewMarket(market) {
    this.props.changeUrl(`/markets/${market.address}`)
  }

  @autobind
  handleViewMarketResolve(event, resolveUrl) {
    event.preventDefault()
    event.stopPropagation()

    this.props.changeUrl(resolveUrl)
  }

  @autobind
  handleCreateMarket() {
    if (this.props.defaultAccount) {
      this.props.changeUrl('/markets/new')
    }
  }

  renderCategoricalOutcomes(market) {}

  renderScalarOutcomes(market) {}

  @autobind
  renderMarket(market) {
    const isResolved = market.oracle && market.oracle.isOutcomeSet
    const isOwner = this.props.defaultAccount && market.creator === this.props.defaultAccount

    const resolveUrl = `/markets/${market.address}/resolve`

    const outcomes = <Outcome market={market} />

    return (
      <button
        type="button"
        className={`market ${isResolved ? 'market--resolved' : ''}`}
        key={market.address}
        onClick={() => this.handleViewMarket(market)}
      >
        <div className="market__header">
          <h2 className="market__title">{market.eventDescription.title}</h2>
          {isOwner &&
          !isResolved && (
            <div className="market__control">
              <a href={`/#${resolveUrl}`} onClick={e => this.handleViewMarketResolve(e, resolveUrl)}>
                Resolve
              </a>
            </div>
          )}
        </div>
        {outcomes}
        <div className="market__info row">
          {isResolved ? (
            <div className="info__group col-md-3">
              <div className="info_field">
                <div className="info__field--icon icon icon--checkmark" />
                <div className="info__field--label">Resolved</div>
              </div>
            </div>
          ) : (
            <div className="info__group col-md-3">
              <div className="info__field">
                <div className="info__field--icon icon icon--countdown" />
                <div className="info__field--label">
                  <Countdown target={market.eventDescription.resolutionDate} format={RESOLUTION_TIME.RELATIVE_FORMAT} />
                </div>
              </div>
            </div>
          )}
          <div className="info__group col-md-3">
            <div className="info__field">
              <div className="info__field--icon icon icon--enddate" />
              <div className="info__field--label">
                {moment(market.eventDescription.resolutionDate).format(RESOLUTION_TIME.ABSOLUTE_FORMAT)}
              </div>
            </div>
          </div>
          <div className="info__group col-md-3">
            <div className="info__field">
              <div className="info__field--icon icon icon--currency" />
              <div className="info__field--label">
                {decimalToText(new Decimal(market.tradingVolume).div(1e18))}&nbsp;
                <CurrencyName collateralToken={market.event.collateralToken} />&nbsp; Volume
              </div>
            </div>
          </div>
        </div>
      </button>
    )
  }

  renderMarkets() {
    const { markets } = this.props

    return (
      <div className="marketList col-md-9">
        {markets.length > 0 ? (
          <div>
            <div className="marketList__title">
              Showing {markets.length} of {markets.length}
            </div>
            <div className="marketListContainer">{markets.map(this.renderMarket)}</div>
          </div>
        ) : (
          <div className="marketListContainer">
            <div className="market no-markets">No Markets available</div>
          </div>
        )}
      </div>
    )
  }

  renderMarketFilter() {
    const { handleSubmit, isModerator } = this.props

    return (
      <div className="marketFilter col-md-3">
        <form onSubmit={handleSubmit}>
          <div className="marketFilter__group">
            <Field
              component={FormInput}
              name="search"
              label="Search"
              placeholder="Title, Description"
              className="marketFilterField marketFilterSearch"
            />
          </div>
          <div className="marketFilter__group">
            <Field name="orderBy" label="Order by" component={FormSelect} values={selectFilter} defaultValue="---" />
          </div>
          <div className="marketFilter__group">
            <Field
              name="resolved"
              label="Resolution Date"
              component={FormRadioButton}
              radioValues={resolutionFilters}
            />
          </div>
          {isModerator ? (
            <div className="marketFilter__group">
              <Field name="myMarkets" label="Show only" text="My markets" component={FormCheckbox} />
            </div>
          ) : (
            <div />
          )}
        </form>
      </div>
    )
  }

  render() {
    const { markets } = this.props

    return (
      <div className="marketListPage">
        <div className="marketListPage__header">
          <div className="container">
            <h1>Market watch</h1>
          </div>
        </div>
        
        <div className="marketListPage__markets">
          <div className="container">
            <div className="row">
              {this.renderMarkets()}
              {this.renderMarketFilter()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

MarketList.propTypes = {
  markets: PropTypes.arrayOf(marketShape),
  defaultAccount: PropTypes.string,
  fetchMarkets: PropTypes.func,
  changeUrl: PropTypes.func,
  handleSubmit: PropTypes.func,
  isModerator: PropTypes.bool,
}

export default reduxForm({
  form: 'marketListFilter',
})(MarketList)
