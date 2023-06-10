import Image from "next/image";
import styles from "./BenefitItem.module.scss";
import { Button } from "../button/button";

type BenefitItemProps = {
  name: string;
  price: number;
  image: string;
  onClick: () => void;
};

export const BenefitItem = ({
  name,
  image,
  price,
  onClick,
}: BenefitItemProps) => {
  return (
    <li className={styles.benefitWrapper}>
      <Image src={image} alt={name} width={64} height={64} />{" "}
      <p className={styles.benefitWrapperName}>{name}</p>
      <span className={styles.price}>
        <p>{price}</p>
        <Image
          src="/icon/parkcoin-filled.svg"
          alt="parcoin icon"
          height={24}
          width={24}
        />
      </span>
      <Button type="primary" text="Claim" onClick={onClick} />
    </li>
  );
};
