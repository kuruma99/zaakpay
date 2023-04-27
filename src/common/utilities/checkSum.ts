import { zaakpay } from 'src/config/zaakpay.config';

import CryptoJS from 'crypto-js';
const secretkey = zaakpay.secretkey;

export const getChecksumString = function (data) {
  let checksumstring = '';
  const checksumsequence = [
    'amount',
    'bankid',
    'buyerAddress',
    'buyerCity',
    'buyerCountry',
    'buyerEmail',
    'buyerFirstName',
    'buyerLastName',
    'buyerPhoneNumber',
    'buyerPincode',
    'buyerState',
    'currency',
    'debitorcredit',
    'merchantIdentifier',
    'merchantIpAddress',
    'mode',
    'orderId',
    'product1Description',
    'product2Description',
    'product3Description',
    'product4Description',
    'productDescription',
    'productInfo',
    'purpose',
    'returnUrl',
    'shipToAddress',
    'shipToCity',
    'shipToCountry',
    'shipToFirstname',
    'shipToLastname',
    'shipToPhoneNumber',
    'shipToPincode',
    'shipToState',
    'showMobile',
    'txnDate',
    'txnType',
    'zpPayOption',
  ];
  for (const seq in checksumsequence) {
    for (const key in data) {
      if (key.toString() === checksumsequence[seq]) {
        if (data[key].toString() !== '') {
          checksumstring += key + '=' + data[key].toString() + '&';
        }
      }
    }
  }
  return checksumstring;
};

export const getResponseChecksumString = function (data) {
  let checksumstring = '';
  const checksumsequence = [
    'amount',
    'bank',
    'bankid',
    'cardId',
    'cardScheme',
    'cardToken',
    'cardhashid',
    'doRedirect',
    'orderId',
    'paymentMethod',
    'paymentMode',
    'responseCode',
    'responseDescription',
    'productDescription',
    'product1Description',
    'product2Description',
    'product3Description',
    'product4Description',
    'pgTransId',
    'pgTransTime',
  ];

  for (const seq in checksumsequence) {
    for (const key in data) {
      if (key.toString() === checksumsequence[seq]) {
        checksumstring += key + '=' + data[key].toString() + '&';
      }
    }
  }
  return checksumstring;
};

export const calculateChecksum = function (checksumstring) {
  return CryptoJS.HmacSHA256(checksumstring, secretkey);
};
