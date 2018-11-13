swagger: '2.0'
info:
  version: "2016-06-30"
  title: Ads API - (Live Ads)
  description: |
   ## API Basics
   Our library of API's strive to be RESTFul and are organized around the main resources already in place today. Before you do anything, you should register for an API key so that you can make API calls.

   Below you will find general information that applies to all of our API's.

   ### Versioning
   By default, all updates will be backwards compatible. If a breaking change is introduced a new version number will be defined. A breaking change is defined as a removal of a field from the response, renaming an existing field or a new required input argument.

    New properties in the response and new optional arguments in the input would not be deemed as a breaking change and thus will be implemented in the same version.

    There are 2 different ways to use versioning with the API, they are as follows:

    #### URL Versioning
    * http://BASE_URL/v1/resource?queryParameters


    #### Header Versioning
    * Accept: application/json; version=1


    ### Example Responses
    Sample API responses are provided next to each method. Please note that these responses are just examples and not all the data elements that may be returned by the endpoint will appear in this example response. For a complete list of possible response objects please read the method description.

    ### Input/Output Format
    Both the request body data and the response data are formatted as JSON.

    ### GZIP
    If you would like responses to be compressed for faster response times, simply include an **Accept-Encoding** header with a value of **gzip**, and responses will be gzipped.


    ### CORS Support
    The API also supports Cross-Origin Resource Sharing (CORS) which allows cross-domain requests to be made by JavaScript on a web page. Such “cross-domain” requests would otherwise be forbidden by web browsers, per the same origin security policy. CORS is supported by all modern web browsers, and a full list of browser support can be found [here](http://caniuse.com/cors).


    ### Upcoming Changes
    We are always maintaining, fixing, and enhancing our API. As such, you should expect new endpoints to show up, new fields to be added to responses and new error codes to appear. We recommend that you build your code to gracefully ignore things that you aren’t expecting, and to handle errors in standard HTTP-centric ways.

    --------

    ### Authentication
    All of our API's use a **api_key** parameter added to the query string to authenticate and validate requests. You must register for an account to obtain your api_key.

    If you send an invalid api_key or your key has been revoked you will get a **401** Unauthorized response.


    ### Errors
    All of our API's utilize [standard HTTP status codes](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) to communciate errors.
    We strive to follow the pattern below:
    * 2xx - The request was successfully received, understood, and accepted
    * 3xx - Further action needs to be taken by the user agent in order to fulfill the request
    * 4xx - An error in the request. Usually a bad parameter.
    * 5xx - The request is fine, but something is wrong on our side

schemes:
  - https
consumes:
  - application/json
produces:
  - application/json
host:
  sandbox.api.kbb.com
basePath:
  /ads
tags:
  - name: Vehicle
    description: All methods related to vehicles
################################################################################
#                                  Security                                    #
################################################################################
securityDefinitions:
  keyQuery:
    type: apiKey
    name: api_key
    in: query
security:
  - keyQuery: []

################################################################################
#                                   Parameters                                 #
################################################################################
parameters:
  vehicleIds:
    name: vehicleIds
    in: query
    description: Comma seperated list of Vehicle id's
    type: string
    required: true
  zipcode:
    name: zipcode
    in: query
    description: Desired zipcode to use for regionality
    type: string
    required: true
  dataVersionId:
    name: dataVersionId
    in: query
    description: The version to override
    type: integer
    required: false
  campaign-key:
    name: campaign-key
    in: query
    description: The campaign identifier
    type: string
    required: false
  version:
    name: version
    in: path
    type: string
    description: API Version
    required: true
    enum:
      - v1

paths:
  /{version}/cto/default:
    get:
      description:  The cost of ownership resources will provide the developer the dataset and segments for 5 year cost to own
      security:
        - keyQuery: []
      tags:
        - Vehicle                
      parameters:
        - $ref: '#/parameters/version'
        - $ref: '#/parameters/vehicleIds'
        - $ref: '#/parameters/zipcode'
        - $ref: '#/parameters/campaign-key'
        - $ref: '#/parameters/dataVersionId'
      responses:
        200:
          description: Successful response
          schema:
              allOf:
              - $ref: '#/definitions/Response'
              - type: object
                required:
                  - results
                properties:
                  results:
                    $ref: '#/definitions/CTO'    
        500:
          description: Server Exception
  /{version}/pricing/default/{class}:
    get:
      description:  The pricing resource provide Kelley Blue book pricing information using the vehicles default configuration.
      security:
        - keyQuery: []
      tags:
        - Vehicle              
      parameters:
        - $ref: '#/parameters/version'
        - name: class
          description: |
            new - New Car
            used - Used Car
          type: string
          in: path
          required: true
          enum:
            - new
            - used
        - $ref: '#/parameters/vehicleIds'
        - $ref: '#/parameters/zipcode'
        - $ref: '#/parameters/campaign-key'
        - $ref: '#/parameters/dataVersionId'
      responses:
        200:
          description: Successful response
          schema:
            allOf:
              - $ref: '#/definitions/Response'
              - type: object
                required:
                  - results
                properties:
                  results:
                    $ref: '#/definitions/Pricing'    
  /{version}/ratings/expert:
    get:
      description: >
        The expert ratings resource provides vehicle ratings content by Kelley Blue Book.  The following ratings content secrtions are available in the response object.
        ```
        - 2000003070 | Overall Overal Rating
        - 2000003071 | Driving Dynamicst
        - 2000003072 | Comfort & Convenience
        - 2000003073 | Design: Interios & Exterior
        - 2000003074 | Safety
        - 2000003075 | Value
        ```
      security:
        - keyQuery: []
      tags:
        - Vehicle              
      parameters:
        - $ref: '#/parameters/version'
        - $ref: '#/parameters/vehicleIds'
        - $ref: '#/parameters/campaign-key'
        - $ref: '#/parameters/dataVersionId'
      responses:
        200:
          description: Successful response
          schema:
            allOf:
              - $ref: '#/definitions/Response'
              - type: object
                required:
                  - expertRatings
                properties:
                  expertRatings:
                    $ref: '#/definitions/ExpertRatings'    
  /{version}/ratings/consumer:
    get:
      description: >
        The consumer ratings resource provides vehicle ratings content producted by users.  The following ratings content sections are available in the response object.

        - Overal Rating
        - Comfort
        - Performance
        - Quality
        - Reliability
        - Styling
        - Value

      security:
        - keyQuery: []
      tags:
        - Vehicle              
      parameters:
        - $ref: '#/parameters/version'
        - $ref: '#/parameters/vehicleIds'
        - $ref: '#/parameters/campaign-key'
        - $ref: '#/parameters/dataVersionId'
      responses:
        200:
          description: Successful response
          schema:
            allOf:
              - $ref: '#/definitions/Response'
              - type: object
                required:
                  - consumerRatings
                properties:
                  consumerRatings:
                    $ref: '#/definitions/ConsumerRatings'
  /{version}/reviews/expert:
    get:
      description: >
        The expert review resource proviudes editoral content produced by Kelley Blue Book.  The following content sections are available in the response object.
        ```
        - 34         | KBB Editor's Overview
        - 35/36      | What's New for [Vehicle Model Year]
        - 37         | You'll Like This Car If...
        - 38         | You May Not Like This Car If...
        - 39         | Exterior
        - 40         | Interior
        - 41         | Notable Standard Equipment
        - 42         | Notable Optional Equipment
        - 43         | Pricing Notes
        - 44         | Driving Impressions
        - 45         | Favorite Features
        - 46         | Under the Hood
        - 2000003080 | Overview
        - 2000003081 | Teaser
        ```
      security:
        - keyQuery: []
      tags:
        - Vehicle                
      parameters:
        - $ref: '#/parameters/version'
        - name: vehicleId
          in: query
          type: integer
          description: The KBB vehicle identifier
          required: true
        - $ref: '#/parameters/campaign-key'
        - $ref: '#/parameters/dataVersionId'
      responses:
        200:
          description: Successful response
          schema:
            allOf:
              - $ref: '#/definitions/Response'
              - type: object
                required:
                  - expertReview
                properties:
                  expertReview:
                    $ref: '#/definitions/ExpertReveiws'
  /{version}/vehicle:
    get:
      description: The vehicle endpoint is used to retrieve the following information of a vehicle
      parameters:
        - $ref: '#/parameters/version'
        - $ref: '#/parameters/vehicleIds'
        - $ref: '#/parameters/campaign-key'
        - $ref: '#/parameters/dataVersionId'
      security:
        - keyQuery: []
      tags:
        - Vehicle                
      responses:
        200:
          description: Successful response
          schema:
            allOf:
              - $ref: '#/definitions/Response'
              - type: object
                required:
                  - results
                properties:
                  results:
                    $ref: '#/definitions/Vehicle'
  /{version}/fuelcost/configured:
    post:
      description: The fuel cost calculator s used to illustrate an annual fuel cost savings of a vehicle
      parameters:
        - name: version
          in: path
          type: string
          description: API Version
          required: true
          enum:
            - v1
            - v2
        - $ref: '#/parameters/campaign-key'
        - $ref: '#/parameters/dataVersionId'
        - name: query
          in: body
          required: true
          schema:
            type: array
            items:
              type: object
              properties:
                vehicleId:
                  type: integer
                engineOptionId:
                  type: integer
                drivetrainOptionId:
                  type: integer
                transmissionOptionId:
                  type: integer
      security:
        - keyQuery: []
      tags:
        - Vehicle                        
      responses:
        200:
          description: Successful response
          schema:
            allOf:
              - $ref: '#/definitions/Response'
              - type: object
                required:
                  - results
                properties:
                  results:
                    $ref: '#/definitions/FuelCost'
  /{version}/fuelcost/default:
    post:
      description: The fuel cost calculator s used to illustrate an annual fuel cost savings of a vehicle
      parameters:
        - name: version
          in: path
          type: string
          description: API Version
          required: true
          enum:
            - v1
            - v2
        - $ref: '#/parameters/campaign-key'
        - $ref: '#/parameters/dataVersionId'
        - name: query
          in: body
          required: true
          description: |
            VehicleId is required. Note: The request body is an array of requests so you will need the begin and end square brackets even requesting only 1 vehicle.
          schema:
            type: array
            items:
              type: object
              properties:
                vehicleId:
                  type: integer
      security:
        - keyQuery: []                
      tags:
        - Vehicle                                
      responses:
        200:
          description: Successful response
          schema:
            allOf:
              - $ref: '#/definitions/Response'
              - type: object
                required:
                  - results
                properties:
                  results:
                    $ref: '#/definitions/FuelCost'
  /{version}/specs/default:
    post:
      description: The specs endpoint is used to retrieve the specs of a vehicle.
      parameters:
        - $ref: '#/parameters/version'
        - $ref: '#/parameters/campaign-key'
        - $ref: '#/parameters/dataVersionId'
        - name: query
          in: body
          required: true
          schema:
            type: array
            items:
              type: object
              properties:
                vehicleId:
                  type: integer
      security:
        - keyQuery: []                
      tags:
        - Vehicle                  
      responses:
        200:
          description: Successful response
          schema:
            allOf:
              - $ref: '#/definitions/Response'
              - type: object
                required:
                  - results
                properties:
                  results:
                    $ref: '#/definitions/Specs'
definitions:
  Response:
    type: object
    properties:
      dataVersion:
        $ref : '#/definitions/DataVersion'
  DataVersion:
    type: object
    required: [ dataVersionId, startDate, endDate ]
    properties:
      dataVersionId:
        type: string
      startDate:
        type: string
        format: date
      endDate:
        format: date
        type: string
  CTO:
    type: object
    properties:
      vehicleId:
        type: integer
      zipCode:
        type: string
      regionId:
        type: integer
      isNationalPricing:
        type: boolean
      costPerMile:
        type: number
        format: float
      fiveYearTotalCostSum:
        type: integer
      fiveYearTotalCostAvg:
        type: integer
      fuel:
        $ref : '#/definitions/CTOAttribute'
      insurance:
        $ref : '#/definitions/CTOAttribute'        
      finance:
        $ref : '#/definitions/CTOAttribute'
      stateFees:
        $ref : '#/definitions/CTOAttribute'
      maintenance:
        $ref : '#/definitions/CTOAttribute'
      repairs:
        $ref : '#/definitions/CTOAttribute'
      depreciation:
        $ref : '#/definitions/CTOAttribute'
      yearSummary:
        $ref : '#/definitions/CTOYearSummary'
  CTOAttribute:
    type: object
    properties:
      description:
        type: string
      label:
        type: string
      totalSum:
        type: integer
      totalAvg:
        type: integer
      years:
        type: object
        properties:
          1:
            type: integer
          2:
            type: integer
          3:
            type: integer
          4:
            type: integer
          5:
            type: integer
  CTOYearSummary:
    type: object
    properties:
      yearId:
        type: integer
      totalSum:
        type: integer
  Pricing:
    type: object
    properties:
      vehicleId:
        type: integer
      zipCode:
        type: integer
      regionId:
        type: integer
      isNationalPricing:
        type: boolean
      prices:
        type: array
        items:
          type: object
          description: >
            ```
            - 108 | Certified Pre-OwnedUsed
            - 130 | Used Car Fair Purchase PriceUsed
            - 4   | Trade-In Value: GoodUsed
            - 3   | Trade-In Value: FairUsed
            - 5   | Trade-In Value: ExcellentUsed
            - 109 | Trade-In Value: Very GoodUsed
            - 12  | New Car Fair Purchase PriceNew
            - 10  | MSRPNew
            - 112 | Resale at 12 MonthsNew
            - 26  | Resale at 24 MonthsNew
            - 27  | Resale at 36 MonthsNew
            - 28  | Resale at 48 MonthsNew
            - 29  | Resale at 60 MonthsNew
            ```
          properties:
            name:
              type: string
            id:
              type: integer
            price:  
              type: number
              format: float
            percent:
              type: number
              format: float
  ExpertRatings:
    type: object
    properties:
      vehicleId:
        type: integer
      contentId:
        type: integer
      year:
        type: integer
      ratings:
        type: array
        items:
          type: object
          properties:
            contentSectionId:
              type: integer
            name:
              type: string
            value:
              type: number
              format: float
  ConsumerRatings:
    type: object
    properties:
      vehicleId:
        type: integer
      numberOfRatings:
        type: integer
      generationBeginYear:
        type: integer
      generationEndYear:
        type: integer
      ratings:
        type: array
        items:
          type: object
          properties:
            name:
              type: string
            value:
              type: integer
  ExpertReveiws:
    type: object
    properties:
      vehicleId:
        type: integer
      year:
        type: integer
      contentId:
        type: integer
      reviewSections:
        type: array
        items:
          type: object
          properties:
            contentSectionId:
              type: integer
            sectionName:
              type: integer
            textVersion:
              type: string
            htmlVersion:
              type: string
  Vehicle:
    type: object
    properties:
      vehicleId:
        type: integer
      year:
        type: integer
      make:
        type: string
      model:
        type: string
      trim:
        type: string
  FuelCost:
    type: object
    properties:
      vehicleId:
        type: integer
      isDefault:
        type: boolean
      engineOptionId:
        type: integer
      drivetrainOptionId:
        type: integer
      transmissionOptionId:
        type: integer
      fuel:
        $ref : '#/definitions/FuelCostDetail'  
      electric:
        $ref : '#/definitions/FuelCostDetail'  

  FuelCostDetail:
    type: object
    properties:
      annualFuelCost:
        type: number
        format: float
      cityMiles:
        type: integer
      combinedMiles:
        type: integer
      fuelCost:
        type: number
        format: float
      highwayMiles:
        type: integer
      recommendedFuel:
        type: string
  Specs:
    type: object
    properties:
      vehicleId:
        type: integer
      driveTrains:
        type: array
        items:
          type: object
          properties:
            vehicleOptionId:
              type: integer
            isDefault:
              type: boolean
            driveTrainType:
              type: string
      engines:
        type: array
        items:
          type: object
          properties:
            vehicleOptionId:
              type: integer
            isDefault:
              type: boolean
            bore:
              type: number
              format: float
            compressionRatio:
              type: number
              format: float
            cylinders:
              type: integer
            displacement:
              type: number
              format: float
            emissionsRatings:
              type: string
            engineConfiguration:
              type: string
            engineType:
              type: string
            fuelInduction:
              type: string
            horsepower:
              type: integer
            horsepowerRPM:
              type: integer
            maxRPM:
              type: integer
            recommendedFuel:
              type: string
            stroke:
              type: number
              format: float
            torque:
              type: integer
            torqueRPM:
              type: integer
            valves:
              type: integer
            valveTrain:
              type: string
      mpgs:
        type: array
        items:
          type: object
          properties:
            mpgCity:
              type: integer
            mpgCombined:
              type: integer
            mpgHwy:
              type: integer
            mpgECity:
              type: integer
            mpgEHwy:
              type: integer
            mpgeCombined:
              type: integer
      transmissions:
        type: array
        items:
          type: object
          properties:
            vehicleOptionId:
              type: integer
            isDefault:
              type: boolean
            tranmissionType:
              type: string
            transmissionSubType:
              type: string
            numberOfSpeeds:
              type: integer
            manualMode:
              type: string
