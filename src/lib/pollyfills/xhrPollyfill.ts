export class XMLHttpRequestPolyfill implements XMLHttpRequest {
  DONE: number;
  HEADERS_RECEIVED: number;
  LOADING: number;
  OPENED: number;
  UNSENT: number;
  // Static state constants
  static readonly UNSENT: number = 0;
  static readonly OPENED: number = 1;
  static readonly HEADERS_RECEIVED: number = 2;
  static readonly LOADING: number = 3;
  static readonly DONE: number = 4;

  // Instance properties
  readyState: number = XMLHttpRequestPolyfill.UNSENT;
  status: number = 0;
  statusText: string = "";
  responseText: string = "";
  response: any = null;
  responseType: XMLHttpRequestResponseType = "";
  responseURL: string = "";
  responseXML: Document | null = null;
  timeout: number = 0;
  upload: XMLHttpRequestUpload = {} as XMLHttpRequestUpload; // Simplified for the polyfill
  withCredentials: boolean = false;

  // Event handlers
  onload: ((this: XMLHttpRequest, ev: Event) => any) | null = null;
  onerror: ((this: XMLHttpRequest, ev: Event) => any) | null = null;
  onabort: ((this: XMLHttpRequest, ev: Event) => any) | null = null;
  ontimeout: ((this: XMLHttpRequest, ev: Event) => any) | null = null;
  onloadend: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null;
  onloadstart: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null;
  onprogress: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null;
  onreadystatechange: ((this: XMLHttpRequest, ev: Event) => any) | null = null;

  private headers: Headers = new Headers();
  private method: string | null = null;
  private url: string | null = null;
  private async: boolean = true;
  private abortController: AbortController | null = null;

  open(method: string, url: string, async: boolean = true): void {
    this.method = method;
    this.url = url;
    this.async = async;
    this.readyState = XMLHttpRequestPolyfill.OPENED; // OPENED
    this._triggerReadyStateChange();
  }

  setRequestHeader(header: string, value: string): void {
    this.headers.append(header, value);
  }

  send(body: Document | BodyInit | null = null): void {
    if (!this.method || !this.url) {
      throw new Error("XMLHttpRequest must be opened before sending.");
    }

    this.abortController = new AbortController();

    // Convert Document to string if necessary
    const requestBody =
      body instanceof Document
        ? new XMLSerializer().serializeToString(body)
        : body;

    fetch(this.url, {
      method: this.method,
      headers: this.headers,
      body: requestBody,
      signal: this.abortController.signal,
    })
      .then((response) => {
        this.status = response.status;
        this.statusText = response.statusText;
        this.responseURL = response.url;

        // Simulate LOADING state
        this.readyState = XMLHttpRequestPolyfill.LOADING;
        this._triggerReadyStateChange();

        // Handle response based on responseType
        if (this.responseType === "json") {
          return response.json().then((data) => {
            this.response = data;
            this.readyState = XMLHttpRequestPolyfill.DONE; // DONE
            this._triggerReadyStateChange();
            if (this.onload) {
              this.onload(new Event("load"));
            }
          });
        } else if (this.responseType === "text" || this.responseType === "") {
          return response.text().then((text) => {
            this.responseText = text;
            this.response = text;
            this.readyState = XMLHttpRequestPolyfill.DONE; // DONE
            this._triggerReadyStateChange();
            if (this.onload) {
              this.onload(new Event("load"));
            }
          });
        } else {
          console.warn(`Unsupported responseType: ${this.responseType}`);
        }
      })
      .catch((error) => {
        if (this.abortController?.signal.aborted) {
          if (this.onabort) {
            this.onabort(new Event("abort"));
          }
        } else {
          this.readyState = XMLHttpRequestPolyfill.DONE; // DONE
          this._triggerReadyStateChange();
          if (this.onerror) {
            this.onerror(new Event("error"));
          }
        }
      });
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  getAllResponseHeaders(): string {
    return ""; // Implement if necessary
  }

  getResponseHeader(header: string): string | null {
    return this.headers.get(header);
  }

  overrideMimeType(mime: string): void {
    console.warn("overrideMimeType is not implemented in this polyfill.");
  }

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    console.warn("addEventListener is not implemented in this polyfill.");
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void {
    console.warn("removeEventListener is not implemented in this polyfill.");
  }

  dispatchEvent(event: Event): boolean {
    console.warn("dispatchEvent is not implemented in this polyfill.");

    return false;
  }

  private _triggerReadyStateChange(): void {
    if (this.onreadystatechange) {
      this.onreadystatechange(new Event("readystatechange"));
    }
  }
}
