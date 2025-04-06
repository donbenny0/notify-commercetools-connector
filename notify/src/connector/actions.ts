import { GoogleCloudPubSubDestination } from '@commercetools/platform-sdk';
import { deleteCustomObjectRepository, updateCustomObjectRepository } from '../repository/customObjects/customObjects.repository';
import { CreateCustomObjectInterface } from '../interface/customObject.interface';

export async function createNotifyObjects(topicName: string, projectId: string): Promise<void> {
  const destination: GoogleCloudPubSubDestination = {
    type: 'GoogleCloudPubSub',
    topic: topicName,
    projectId,
  };
  await createInitialProjectCustomObjects(destination);
}

async function createInitialProjectCustomObjects(destination: GoogleCloudPubSubDestination) {
  // 1. Create a custom object for the channels
  // Container : "notify-channels",
  // Key       : "notify-channels-key",
  const channelContainer = await initializeChannels();
  //  2. Create a custom object for the subscription body
  // Container : "notify-subscriptions",
  // Key       : "notify-subscriptions-key",
  // Requsites
  // Fetch the GCP credentials from the environment variables
  // Fetch the notify-channels object id from the commercetools API
  // Create an reference to the notify-channels object in the notify-subscriptions object
  await initializeSubscriptions(channelContainer.id, destination);
  // 3. Create a custom object for trigger list
  // Container : "notify-trigger-list"
  // Key       : "notify-trigger-list-key",
  await initializeTriggerList();
}

// create channel container
async function initializeChannels() {
  const channelBody: CreateCustomObjectInterface = {
    container: "notify-channels",
    key: "notify-channels-key",
    value: {
      whatsapp: {
        configurations: {
          isEnabled: false,
          messageBody: {},
        }
      },
      email: {
        configurations: {
          isEnabled: false,
          messageBody: {},
        }
      },
      sms: {
        configurations: {
          isEnabled: false,
          messageBody: {},
        }
      }
    }
  }
  const response = await updateCustomObjectRepository(channelBody)
  return response;
}

async function initializeSubscriptions(channelId: string, destination: GoogleCloudPubSubDestination) {
  const subscriptionBody: CreateCustomObjectInterface = {
    container: "notify-subscriptions",
    key: "notify-subscriptions-key",
    value: {
      pubsubReference: {
        projectId: destination.projectId,
        topic: destination.topic
      },
      references: {
        id: channelId,
        typeId: "key-value-document"
      },
      channels: {
        whatsapp: {
          subscriptions: [
          ]
        },
        sms: {
          subscriptions: []
        }
      }
    }
  }
  const response = await updateCustomObjectRepository(subscriptionBody)
  return response;
}

async function initializeTriggerList() {
  const triggerListBody: CreateCustomObjectInterface = {
    container: "notify-trigger-list",
    key: "notify-trigger-list-key",
    value: {
      "category": [
        "CategoryCreated",
        "CategorySlugChanged"
      ],
      "customer": [
        "CustomerCreated",
        "CustomerDeleted",
        "CustomerAddressChanged",
        "CustomerEmailChanged",
        "CustomerEmailVerified",
        "CustomerFirstNameSet",
        "CustomerLastNameSet",
        "CustomerTitleSet",
        "CustomerCompanyNameSet",
        "CustomerDateOfBirthSet",
        "CustomerGroupSet",
        "CustomerAddressRemoved",
        "CustomerAddressAdded",
        "CustomerPasswordUpdated",
        "CustomerCustomFieldAdded",
        "CustomerCustomFieldChanged",
        "CustomerCustomFieldRemoved",
        "CustomerCustomTypeSet",
        "CustomerCustomTypeRemoved",
        "CustomerAddressCustomFieldAdded",
        "CustomerAddressCustomFieldChanged",
        "CustomerAddressCustomFieldRemoved",
        "CustomerAddressCustomTypeSet",
        "CustomerAddressCustomTypeRemoved"
      ],
      "inventory-entry": [
        "InventoryEntryCreated",
        "InventoryEntryDeleted",
        "InventoryEntryQuantitySet"
      ],
      "order": [
        "OrderCreated",
        "OrderImported",
        "OrderEditApplied",
        "OrderDeleted",
        "PurchaseOrderNumberSet",
        "OrderCustomerSet",
        "OrderCustomerEmailSet",
        "OrderCustomerGroupSet",
        "OrderLineItemAdded",
        "OrderLineItemRemoved",
        "OrderCustomLineItemAdded",
        "OrderCustomLineItemRemoved",
        "OrderDiscountCodeAdded",
        "OrderDiscountCodeRemoved",
        "OrderDiscountCodeStateSet",
        "OrderPaymentAdded",
        "OrderPaymentStateChanged",
        "OrderBillingAddressSet",
        "OrderShippingAddressSet",
        "OrderShippingInfoSet",
        "OrderShippingRateInputSet",
        "OrderShipmentStateChanged",
        "DeliveryAdded",
        "DeliveryRemoved",
        "ReturnInfoAdded",
        "ReturnInfoSet",
        "OrderStateChanged",
        "OrderStateTransition",
        "OrderStoreSet",
        "OrderBusinessUnitSet",
        "OrderLineItemDistributionChannelSet",
        "OrderLineItemDiscountSet",
        "LineItemStateTransition",
        "OrderCustomLineItemQuantityChanged",
        "OrderCustomLineItemDiscountSet",
        "CustomLineItemStateTransition",
        "DeliveryAddressSet",
        "ParcelAddedToDelivery",
        "ParcelRemovedFromDelivery",
        "DeliveryItemsUpdated",
        "DeliveryCustomFieldAdded",
        "DeliveryCustomFieldChanged",
        "DeliveryCustomFieldRemoved",
        "DeliveryCustomTypeSet",
        "DeliveryCustomTypeRemoved",
        "ParcelMeasurementsUpdated",
        "ParcelTrackingDataUpdated",
        "ParcelItemsUpdated",
        "OrderReturnShipmentStateChanged",
        "OrderCustomFieldAdded",
        "OrderCustomFieldChanged",
        "OrderCustomFieldRemoved",
        "OrderCustomTypeSet",
        "OrderCustomTypeRemoved"
      ],
      "payment": [
        "PaymentCreated",
        "PaymentInteractionAdded",
        "PaymentTransactionAdded",
        "PaymentTransactionStateChanged",
        "PaymentStatusStateTransition",
        "PaymentStatusInterfaceCodeSet"
      ],
      "product": [
        "ProductCreated",
        "ProductPublished",
        "ProductUnpublished",
        "ProductStateTransition",
        "ProductSlugChanged",
        "ProductImageAdded",
        "ProductRevertedStagedChanges",
        "ProductPriceKeySet",
        "ProductPriceDiscountsSet",
        "ProductPriceDiscountsSetUpdatedPrice",
        "ProductPriceExternalDiscountSet",
        "ProductPriceAdded",
        "ProductPriceChanged",
        "ProductPricesSet",
        "ProductPriceRemoved",
        "ProductPriceModeSet",
        "ProductVariantAdded",
        "ProductVariantDeleted",
        "ProductAddedToCategory",
        "ProductRemovedFromCategory",
        "ProductDeleted",
        "ProductPriceCustomFieldAdded",
        "ProductPriceCustomFieldChanged",
        "ProductPriceCustomFieldRemoved",
        "ProductPriceCustomFieldsSet",
        "ProductPriceCustomFieldsRemoved"
      ],
      "product-selection": [
        "ProductSelectionCreated",
        "ProductSelectionProductAdded",
        "ProductSelectionProductExcluded",
        "ProductSelectionProductRemoved",
        "ProductSelectionVariantSelectionChanged",
        "ProductSelectionVariantExclusionChanged",
        "ProductSelectionDeleted"
      ],
      "quote": [
        "QuoteCreated",
        "QuoteRenegotiationRequested",
        "QuoteStateChanged",
        "QuoteStateTransition",
        "QuoteCustomerChanged",
        "QuoteDeleted"
      ],
      "quote-request": [
        "QuoteRequestCreated",
        "QuoteRequestStateChanged",
        "QuoteRequestStateTransition",
        "QuoteRequestCustomerChanged",
        "QuoteRequestDeleted"
      ],
      "review": [
        "ReviewCreated",
        "ReviewStateTransition",
        "ReviewRatingSet"
      ],
      "staged-quote": [
        "StagedQuoteCreated",
        "StagedQuoteStateChanged",
        "StagedQuoteStateTransition",
        "StagedQuoteValidToSet",
        "StagedQuoteSellerCommentSet",
        "StagedQuoteDeleted"
      ],
      "product-tailoring": [
        "ProductTailoringCreated",
        "ProductTailoringDeleted",
        "ProductTailoringNameSet",
        "ProductTailoringDescriptionSet",
        "ProductTailoringSlugSet",
        "ProductTailoringPublished",
        "ProductTailoringUnpublished",
        "ProductVariantTailoringAdded",
        "ProductVariantTailoringRemoved",
        "ProductTailoringImageAdded",
        "ProductTailoringImagesSet"
      ],
      "standalone-price": [
        "StandalonePriceCreated",
        "StandalonePriceDeleted",
        "StandalonePriceValueChanged",
        "StandalonePriceKeySet",
        "StandalonePriceDiscountSet",
        "StandalonePriceExternalDiscountSet",
        "StandalonePriceStagedChangesApplied",
        "StandalonePriceStagedChangesRemoved",
        "StandalonePriceActiveChanged",
        "StandalonePriceValidFromSet",
        "StandalonePriceValidUntilSet",
        "StandalonePriceValidFromAndUntilSet",
        "StandalonePriceTierAdded",
        "StandalonePriceTierRemoved",
        "StandalonePriceTiersSet"
      ],
      "store": [
        "StoreCreated",
        "StoreDeleted",
        "StoreLanguagesChanged",
        "StoreCountriesChanged",
        "StoreNameSet",
        "StoreProductSelectionsChanged",
        "StoreDistributionChannelsChanged",
        "StoreSupplyChannelsChanged"
      ]
    }
  }
  const response = await updateCustomObjectRepository(triggerListBody)
  return response;
}

export async function deleteAllObjects() {

  const toBeDeleted = {
    channels: {
      container: "notify-channels",
      key: "notify-channels-key"
    },
    subscriptions: {
      container: "notify-subscriptions", 
      key: "notify-subscriptions-key"
    },
    triggerList: {
      container: "notify-trigger-list",
      key: "notify-trigger-list-key"
    }
  }

  await Promise.all([
    deleteCustomObjectRepository(toBeDeleted.channels.container, toBeDeleted.channels.key),
    deleteCustomObjectRepository(toBeDeleted.subscriptions.container, toBeDeleted.subscriptions.key),
    deleteCustomObjectRepository(toBeDeleted.triggerList.container, toBeDeleted.triggerList.key)
  ]);
}
