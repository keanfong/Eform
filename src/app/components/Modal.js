import React, { createRef, useEffect } from "react";
// import { createPortal } from "react-dom";

import { Modal } from "react-bootstrap";

const ModalContainer = ({ isOpen, onClose, modalTitle, modalBody, modalFooter}) => {
  const modalEl = createRef();
  const handleCoverClick = e => {
    // if (e.target.hasAttribute("modal")) {
      onClose();
    // }
  };


  useEffect(
    () => {
       
      const handleAnimationEnd = event => {
        if (!isOpen) {
          event.target.classList.remove("show");
          event.target.classList.add("hide");
        } else {
          event.target.classList.remove("hide");
          event.target.classList.add("show");
        }
      };
      let current = modalEl.current || {};

      current.addEventListener("animationend", handleAnimationEnd);

      return () =>
        current.removeEventListener("animationend", handleAnimationEnd);
    },
    [isOpen, modalEl]
  );

  return(
    <>
      <div
        className={`ModalCover ${isOpen ? "show" : "hide"}`}
        onClick={handleCoverClick}
        ref={modalEl}
        modal='true'
      />
        <div ref={modalEl}>
            <Modal
                show={isOpen}
                size="lg"
                dialogClassName={`modal-150w view-form-modal ${isOpen ? "slide-up" : "slide-down"}`}
                aria-labelledby="example-custom-modal-styling-title"
                // aria-labelledby="contained-modal-title-vcenter"
                centered
                ref={modalEl}
                onHide={e => handleCoverClick(e)}
                // footer={[
                    
                // ]}
                // onCancel={onClose}
            >
                <Modal.Header closeButton={e => handleCoverClick(e)}>
                        {modalTitle}
                </Modal.Header>
                <Modal.Body>
                    {modalBody}
                </Modal.Body>
                <Modal.Footer>
                    {modalFooter}
                </Modal.Footer>
            </Modal>
        </div>
    </>
  )
};

export default ModalContainer;
