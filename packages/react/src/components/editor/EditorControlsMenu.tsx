import { Icon } from "@abc-editor/core";
import { Menu, MenuButton, MenuItem } from "@szhsin/react-menu";
import { clsx } from "clsx";
import EditorControlIcon from "./EditorControlIcon";
import styles from "./EditorControls.module.css";

interface Props {
  label: string;
  controls: Array<{
    label: string;
    checked: boolean;
    disabled: boolean;
    icon: Icon;
    onClick: () => void;
  }>;
}

const menuClassName = ({ state }: { state: string }) =>
  clsx({ [styles.controlsMenu]: state === "open" });

export default function EditorControlsMenu({ label, controls }: Props) {
  return (
    <Menu
      menuClassName={menuClassName}
      menuButton={
        <MenuButton
          className={clsx(
            styles.iconButton,
            controls.some((control) => control.checked) && styles.selected,
          )}
          aria-label={label}
          title={label}
        >
          <EditorControlIcon icon={controls[0].icon} size={14} />
          <EditorControlIcon icon={controls[1].icon} size={14} />
        </MenuButton>
      }
      menuStyle={{ zIndex: 999 }}
    >
      {controls.map((control) => (
        <MenuItem
          key={control.label}
          className={clsx(
            styles.iconButton,
            control.checked && styles.selected,
          )}
          role="switch"
          aria-checked={control.checked}
          aria-label={control.label}
          title={control.label}
          disabled={control.disabled}
          onClick={(e) => {
            e.stopPropagation = true;
            e.keepOpen = true;
            control.onClick();
          }}
        >
          <EditorControlIcon icon={control.icon} size={16} />
        </MenuItem>
      ))}
    </Menu>
  );
}
